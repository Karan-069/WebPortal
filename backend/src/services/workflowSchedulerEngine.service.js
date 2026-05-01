import schedule from "node-schedule";
import { Client } from "../models/admin/client.model.js";
import { getTenantConnection } from "../config/connectionManager.js";
import { getTenantModels } from "../models/tenantModels.js";
import { tenantStorage } from "../utils/tenantContext.js";
import logger from "../utils/logger.js";

async function processSLAs(tenantId, models) {
  logger.info(`Running SLA Processor for Tenant: ${tenantId}`);
  const { WorkflowState, Workflow, WorkflowLog, UserDelegation } = models;

  try {
    const pendingStates = await WorkflowState.find({
      status: "pending",
      isActive: true,
    });
    const now = new Date();

    for (const state of pendingStates) {
      const workflow = await Workflow.findById(state.workflowId);
      if (!workflow) continue;

      const currentStage = workflow.WorkflowStage.find(
        (s) => s.stageNumber === state.currentStageNumber,
      );
      if (!currentStage) continue;

      // --- 1. SLA Breach Logic ---
      if (currentStage.slaHours && currentStage.slaHours > 0) {
        const lastUpdatedAt = new Date(state.updatedAt);
        const hoursSinceUpdate = (now - lastUpdatedAt) / (1000 * 60 * 60);

        if (hoursSinceUpdate >= currentStage.slaHours) {
          logger.info(
            `SLA Breach detected for Transaction: ${state.transactionId} on Stage: ${state.currentStageNumber}`,
          );

          await WorkflowLog.create({
            transactionModel: state.transactionModel,
            transactionId: state.transactionId,
            workflowId: state.workflowId,
            StageNo: state.currentStageNumber,
            StageStatus: "auto_notify",
            comments: `SLA of ${currentStage.slaHours} hours breached. Automated reminder recorded.`,
          });

          // Update timestamp to reset SLA reminder clock
          state.updatedAt = now;
          await state.save();
        }
      }

      // --- 2. Out-of-Office (OOO) Delegation Swap Logic ---
      let targetUserId = state.delegatedTo;

      // If not delegated yet, but requires a specific static approver
      if (
        !targetUserId &&
        currentStage.isStatic &&
        currentStage.specificApprovers &&
        currentStage.specificApprovers.length > 0
      ) {
        targetUserId = currentStage.specificApprovers[0];
      }

      if (targetUserId) {
        const ooo = await UserDelegation.findOne({
          userId: targetUserId,
          status: "active",
          startDate: { $lte: now },
          endDate: { $gte: now },
        });

        if (
          ooo &&
          (!state.delegatedTo ||
            state.delegatedTo.toString() !== ooo.delegatedUserId.toString())
        ) {
          logger.info(
            `User OOO detected for Transaction: ${state.transactionId}. Swapping to delegate: ${ooo.delegatedUserId}`,
          );

          state.delegatedTo = ooo.delegatedUserId;
          await state.save();

          await WorkflowLog.create({
            transactionModel: state.transactionModel,
            transactionId: state.transactionId,
            workflowId: state.workflowId,
            StageNo: state.currentStageNumber,
            StageStatus: "delegate",
            userId: ooo.userId,
            comments: `Auto-delegated to alternate user due to Out Of Office policy. Reason: ${ooo.reason || "None"}`,
          });
        }
      }
    }
  } catch (err) {
    logger.error(
      `Error in SLA Processor for Tenant ${tenantId}: ${err.message}`,
    );
  }
}

const functionMap = {
  SLA_PROCESSOR: processSLAs,
};

export const initScheduler = async () => {
  try {
    const clients = await Client.find({ isActive: true });

    for (const client of clients) {
      const tenantId = client._id;
      const connection = await getTenantConnection(tenantId);
      const models = getTenantModels(connection);

      const jobs = await models.SchedulerMaster.find({ isActive: true });

      for (const job of jobs) {
        const targetFn = functionMap[job.jobType];
        if (!targetFn) {
          logger.warn(`No function mapped for jobType: ${job.jobType}`);
          continue;
        }

        // Schedule it using node-schedule
        schedule.scheduleJob(job.jobName, job.scheduleInterval, async () => {
          tenantStorage.run({ models, tenantId }, async () => {
            const start = Date.now();
            let status = "success";
            let errorMessage = "";
            try {
              await targetFn(tenantId, models);
            } catch (err) {
              status = "failed";
              errorMessage = err.message;
            } finally {
              const durationMs = Date.now() - start;
              await models.SchedulerLog.create({
                masterId: job._id,
                executedAt: new Date(),
                status,
                errorMessage,
                durationMs,
                recordsProcessed: 1,
              });
              job.lastRunAt = new Date();
              await job.save();
            }
          });
        });
      }
    }
    logger.info(`Scheduler Engine Initialized for ${clients.length} clients.`);
  } catch (err) {
    logger.error(`Error initializing Scheduler: ${err.message}`);
  }
};
