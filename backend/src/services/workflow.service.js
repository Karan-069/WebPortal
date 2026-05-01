import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { sendMappedEmail } from "../utils/sendEmail.js";
import { syncTransactionStatus } from "../utils/syncTransaction.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

//===========Is Amount Valid For Stage===========

const _isAmountValidForStage = (amount, stage) => {
  const stageMin = parseFloat(stage.minAmount.toString());
  const stageMax = parseFloat(stage.maxAmount.toString());
  const txnAmount = parseFloat(amount.toString());
  return txnAmount >= stageMin && txnAmount <= stageMax;
};

const _getWfState = async (
  WorkflowState,
  transactionId,
  transactionModel,
  session = null,
) => {
  const modelQuery = { $regex: new RegExp(`^${transactionModel}$`, "i") };
  const query = {
    transactionModel: modelQuery,
    $or: [{ transactionId: transactionId }],
  };

  if (mongoose.isValidObjectId(transactionId)) {
    query.$or.push({
      transactionId: new mongoose.Types.ObjectId(transactionId),
    });
  }

  const findQuery = WorkflowState.findOne(query);
  if (session) findQuery.session(session);
  return await findQuery;
};

//===========Get Approver Emails===========

const _getApproverEmails = async (stage) => {
  const { User } = useModels();
  const emails = [];

  // 1. Check for Specific Approvers (Directly assigned to stage)
  if (stage.specificApprovers && stage.specificApprovers.length > 0) {
    const directUsers = await User.find({
      _id: { $in: stage.specificApprovers },
    }).select("email");
    emails.push(...directUsers.map((u) => u.email));
  }

  if (stage.specificApprover) {
    const u = await User.findById(stage.specificApprover).select("email");
    if (u?.email) emails.push(u.email);
  }

  // 2. Check for Role-based Approvers
  if (stage.stageApproverRole) {
    const roleUsers = await User.find({
      "roleAssignments.workflowRole": stage.stageApproverRole,
      isActive: true,
    }).select("email");
    emails.push(...roleUsers.map((u) => u.email));
  }

  return [...new Set(emails.filter(Boolean))]; // Unique non-null emails
};

//===========Extract Recipients===========

const _extractRecipients = async (stage) => {
  const to = [],
    cc = [],
    bcc = [];

  // Get manual notification recipients
  for (const r of stage.notificationRecipients || []) {
    if (r.type === "cc") cc.push(r.email);
    else if (r.type === "bcc") bcc.push(r.email);
    else to.push(r.email);
  }

  // If this is an approval stage, also include the actual approvers in the 'to' list
  if (!stage.isNotificationOnly) {
    const approverEmails = await _getApproverEmails(stage);
    to.push(...approverEmails);
  }

  return {
    to: [...new Set(to.filter(Boolean))],
    cc: [...new Set(cc.filter(Boolean))],
    bcc: [...new Set(bcc.filter(Boolean))],
  };
};

//===========Advance To Next Stage===========

const _advanceToNextStage = async (
  workflowState,
  workflowDoc,
  session,
  actionByUserId,
  emailVariables = {},
) => {
  const { WorkflowLog } = useModels();
  // Sort stages by stageNumber to iterate in order
  const stages = [...workflowDoc.WorkflowStage].sort(
    (a, b) => a.stageNumber - b.stageNumber,
  );

  // Find index of the first stage AFTER the current one
  let idx = stages.findIndex(
    (s) => s.stageNumber > workflowState.currentStageNumber,
  );

  while (idx !== -1 && idx < stages.length) {
    const stage = stages[idx];

    // ── Amount Check ─────────────────────────────────────────────────────────
    if (!_isAmountValidForStage(workflowState.transactionAmount, stage)) {
      idx++;
      continue; // amount out of range → bypass
    }

    // ── Notification-Only Stage ───────────────────────────────────────────────
    if (stage.isNotificationOnly) {
      const { to, cc, bcc } = await _extractRecipients(stage);

      await WorkflowLog.create(
        [
          {
            transactionId: workflowState.transactionId,
            transactionModel: workflowState.transactionModel,
            workflowId: workflowDoc._id,
            StageNo: stage.stageNumber,
            StageStatus: "auto_notify",
            userId: actionByUserId,
            comments: `Auto-notification sent for stage: ${stage.stageName}`,
          },
        ],
        { session },
      );

      // Fire email asynchronously (non-blocking, never throws)
      if (to.length) {
        setImmediate(() => {
          sendMappedEmail(
            "WORKFLOW_STAGE_NOTIFICATION",
            to,
            { ...emailVariables, stageName: stage.stageName },
            { cc, bcc },
          );
        });
      }

      idx++;
      continue; // auto-handled → move on
    }

    // ── Normal Approval Stage Found ───────────────────────────────────────────
    workflowState.currentStageNumber = stage.stageNumber;
    workflowState.status = "pending";
    workflowState.delegatedTo = null;
    return true; // halted at this stage, needs human action
  }

  // ── No More Stages → Workflow Complete ───────────────────────────────────
  workflowState.status = "completed";
  workflowState.delegatedTo = null;
  return false;
};

// ---------------------------------------------------------------------------
// Public Service Methods
// ---------------------------------------------------------------------------

//===========Submit to Workflow===========

export const submitToWorkflow = async (
  transactionId,
  transactionModel,
  amount,
  userId,
  moduleContext = null,
) => {
  const { User, Workflow, WorkflowState, WorkflowLog } = useModels();
  const user = await User.findById(userId).populate("activeWorkflowRole");
  if (!user) throw new ApiError(404, "User not found");

  // Robust role selection: check active role first, then fallback to default if active is missing
  const effectiveRole =
    user.activeWorkflowRole?._id || user.defaultRoleAssignment?.workflowRole;

  const query = {
    transactionType: { $regex: new RegExp(`^${transactionModel}$`, "i") },
    initiatorRole: effectiveRole,
    isActive: true,
  };
  if (moduleContext) query.moduleContext = moduleContext;

  const workflow = await Workflow.findOne(query).sort({ createdAt: -1 });
  if (!workflow) {
    console.error(
      `[WorkflowService] Resolution failed. Model: ${transactionModel}, Role: ${effectiveRole}, UserId: ${userId}`,
    );
    throw new ApiError(
      404,
      `No active workflow found for type '${transactionModel}' matching user role.`,
    );
  }

  if (!workflow.WorkflowStage || workflow.WorkflowStage.length === 0) {
    throw new ApiError(500, "Workflow template has no stages defined.");
  }

  const session = await Workflow.db.startSession();
  session.startTransaction();

  try {
    const existingState = await _getWfState(
      WorkflowState,
      transactionId,
      transactionModel,
      session,
    );

    if (existingState && !["rejected"].includes(existingState.status)) {
      throw new ApiError(400, "Transaction is already in an active workflow.");
    }

    let wfState = existingState;
    if (!wfState) {
      wfState = new WorkflowState({
        transactionId,
        transactionModel,
        workflowId: workflow._id,
        status: "pending",
        transactionAmount: amount,
        currentStageNumber: 0,
      });
    } else {
      wfState.workflowId = workflow._id;
      wfState.transactionAmount = amount;
      wfState.currentStageNumber = 0;
      wfState.status = "pending";
    }

    const emailVars = {
      transactionId: transactionId.toString(),
      transactionModel,
      initiatorName: user.fullName,
      initiatorEmail: user.email,
    };

    const stillActive = await _advanceToNextStage(
      wfState,
      workflow,
      session,
      userId,
      emailVars,
    );
    const syncStatus = stillActive ? wfState.status : "completed";

    await syncTransactionStatus(transactionModel, transactionId, syncStatus, {
      session,
      userId,
    });
    await wfState.save({ session });

    await WorkflowLog.create(
      [
        {
          transactionId,
          transactionModel: wfState.transactionModel,
          workflowId: workflow._id,
          StageNo: wfState.currentStageNumber || 1,
          StageStatus: "submit",
          userId,
          comments: "Workflow initiated by user",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    setImmediate(() => {
      sendMappedEmail("WORKFLOW_SUBMITTED", user.email, emailVars);
    });

    return wfState;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

//===========Process Workflow Action===========

export const processWorkflowAction = async (
  transactionId,
  transactionModel,
  userId,
  action,
  payload = {},
) => {
  const { User, Workflow, WorkflowState, WorkflowLog } = useModels();
  const { comments, delegatedToUserId } = payload;

  const user = await User.findById(userId).populate("activeWorkflowRole");
  if (!user) throw new ApiError(404, "User not found");

  // Helper to normalize IDs for comparison
  const getStrId = (val) => val?._id?.toString() || val?.toString() || null;

  const session = await User.db.startSession();
  session.startTransaction();

  try {
    const wfState = await _getWfState(
      WorkflowState,
      transactionId,
      transactionModel,
      session,
    );
    if (!wfState)
      throw new ApiError(404, "No active workflow found for this transaction.");

    const workflow = await Workflow.findById(wfState.workflowId).session(
      session,
    );
    if (!workflow)
      throw new ApiError(404, "Linked Workflow template not found.");

    workflow.WorkflowStage.sort((a, b) => a.stageNumber - b.stageNumber);
    const currentStage = workflow.WorkflowStage.find(
      (s) => s.stageNumber === wfState.currentStageNumber,
    );

    if (wfState.status === "completed")
      throw new ApiError(400, "Workflow already completed.");
    if (wfState.status === "rejected")
      throw new ApiError(400, "Workflow was rejected and must be resubmitted.");
    if (
      wfState.status === "clarification_requested" &&
      action !== "clarification_provided"
    )
      throw new ApiError(
        400,
        "Awaiting clarification from the initiator. No other action permitted.",
      );

    if (["approve", "reject", "delegate", "clarify"].includes(action)) {
      let isAuthorized = false;
      if (wfState.delegatedTo) {
        isAuthorized = getStrId(wfState.delegatedTo) === userId.toString();
        if (!isAuthorized)
          throw new ApiError(
            403,
            "This transaction was delegated to another user.",
          );
      } else if (currentStage?.isStatic) {
        isAuthorized =
          getStrId(currentStage.specificApprover) === userId.toString();
        if (!isAuthorized)
          throw new ApiError(
            403,
            "You are not the designated static approver for this stage.",
          );
      } else {
        isAuthorized =
          getStrId(user.activeWorkflowRole) ===
          getStrId(currentStage?.stageApproverRole);
        if (!isAuthorized)
          throw new ApiError(
            403,
            "Your Workflow Role does not have permission to act on this stage.",
          );
      }

      // Check if the role actually has 'approver' or 'admin' type for approval actions
      if (["approve", "reject", "clarify"].includes(action)) {
        const roleType = user.activeWorkflowRole?.wfRoleType;
        if (roleType !== "approver" && roleType !== "admin") {
          throw new ApiError(
            403,
            "Your workflow role is not authorized to Approve or Reject transactions.",
          );
        }
      }

      // Check for delegation rights
      if (action === "delegate") {
        if (
          !user.activeWorkflowRole?.canDelegate &&
          user.activeWorkflowRole?.wfRoleType !== "admin"
        ) {
          throw new ApiError(
            403,
            "Your workflow role does not have delegation rights.",
          );
        }
      }
    }

    const emailVars = {
      transactionId: transactionId.toString(),
      transactionModel,
      actionByName: user.fullName,
      actionByEmail: user.email,
      comments: comments || "",
      stageName: currentStage?.stageName || "",
    };

    let logStatus = action;

    if (action === "approve") {
      // ── Mandatory Fields Check ───────────────────────────────────────────────
      if (currentStage?.mandatoryFields?.length > 0) {
        const Model = useModels()[wfState.transactionModel];
        const transaction =
          await Model.findById(transactionId).session(session);

        for (const mf of currentStage.mandatoryFields) {
          // Check if field is mandatory for the current user's workflow role (if specified)
          const isRoleTargeted = mf.roleId
            ? mf.roleId.toString() === user.activeWorkflowRole.toString()
            : true;

          if (isRoleTargeted) {
            const val = transaction[mf.fieldName];
            if (
              val === undefined ||
              val === null ||
              val === "" ||
              (Array.isArray(val) && val.length === 0)
            ) {
              throw new ApiError(
                400,
                `The field '${mf.fieldName}' is mandatory for the current stage approval.`,
              );
            }
          }
        }
      }

      const stillActive = await _advanceToNextStage(
        wfState,
        workflow,
        session,
        userId,
        emailVars,
      );

      if (stillActive) {
        const nextStage = workflow.WorkflowStage.find(
          (s) => s.stageNumber === wfState.currentStageNumber,
        );
        if (nextStage) {
          const { to, cc, bcc } = await _extractRecipients(nextStage);
          if (to.length) {
            setImmediate(() => {
              sendMappedEmail(
                "WORKFLOW_PENDING_APPROVAL",
                to,
                { ...emailVars, stageName: nextStage.stageName },
                { cc, bcc },
              );
            });
          }
        }
      } else {
        setImmediate(() => {
          sendMappedEmail(
            "WORKFLOW_APPROVED",
            emailVars.actionByEmail,
            emailVars,
          );
        });
      }
    } else if (action === "reject") {
      if (!comments)
        throw new ApiError(400, "Comments are mandatory when rejecting.");
      wfState.status = "rejected";
      logStatus = "reject";

      const { to, cc, bcc } = await _extractRecipients(currentStage || {});
      setImmediate(() => {
        sendMappedEmail(
          "WORKFLOW_REJECTED",
          [emailVars.actionByEmail, ...to].filter(Boolean),
          emailVars,
          { cc, bcc },
        );
      });
    } else if (action === "delegate") {
      if (!delegatedToUserId)
        throw new ApiError(
          400,
          "delegatedToUserId is required for delegation.",
        );
      const delegatedUser = await User.findById(delegatedToUserId);
      if (!delegatedUser) throw new ApiError(404, "Delegated user not found.");
      wfState.delegatedTo = delegatedToUserId;

      setImmediate(() => {
        sendMappedEmail("WORKFLOW_DELEGATED", delegatedUser.email, {
          ...emailVars,
          delegatedToName: delegatedUser.fullName,
          delegatedToEmail: delegatedUser.email,
        });
      });
    } else if (action === "clarify") {
      if (!comments)
        throw new ApiError(
          400,
          "Comments are required when requesting clarification.",
        );
      wfState.status = "clarification_requested";
      logStatus = "clarification_requested";

      const submitLog = await WorkflowLog.findOne({
        transactionId,
        transactionModel,
        StageStatus: "submit",
      }).sort({ createdAt: 1 });

      if (submitLog) {
        const initiator = await User.findById(submitLog.userId);
        if (initiator) {
          setImmediate(() => {
            sendMappedEmail(
              "WORKFLOW_CLARIFICATION_REQUESTED",
              initiator.email,
              emailVars,
            );
          });
        }
      }
    } else if (action === "clarification_provided") {
      if (wfState.status !== "clarification_requested")
        throw new ApiError(
          400,
          "Clarification was not requested for this transaction.",
        );
      if (!comments)
        throw new ApiError(
          400,
          "Comments are required when providing clarification.",
        );
      wfState.status = "pending";
      logStatus = "clarification_provided";

      if (currentStage) {
        const { to, cc, bcc } = await _extractRecipients(currentStage);
        if (to.length) {
          setImmediate(() => {
            sendMappedEmail("WORKFLOW_CLARIFICATION_PROVIDED", to, emailVars, {
              cc,
              bcc,
            });
          });
        }
      }
    } else {
      throw new ApiError(400, `Unknown action: "${action}".`);
    }

    await syncTransactionStatus(
      transactionModel,
      transactionId,
      wfState.status,
      { session, userId },
    );
    await wfState.save({ session });

    await WorkflowLog.create(
      [
        {
          transactionId,
          transactionModel: wfState.transactionModel,
          workflowId: workflow._id,
          StageNo: currentStage?.stageNumber || wfState.currentStageNumber,
          StageStatus: logStatus,
          userId,
          comments,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return wfState;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

//===========Bulk Actions===========

export const bulkProcessActionsBackground = async (
  bulkPayload,
  userId,
  action,
) => {
  const { Notification } = useModels();
  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  for (const item of bulkPayload) {
    try {
      await processWorkflowAction(
        item.transactionId,
        item.transactionModel,
        userId,
        action,
        { comments: item.comments, delegatedToUserId: item.delegatedToUserId },
      );
      successCount++;
    } catch (err) {
      failureCount++;
      errors.push({ transactionId: item.transactionId, error: err.message });
    }
  }

  try {
    await Notification.create({
      userId: userId,
      title: "Bulk Workflow Processing Complete",
      message: `${successCount} succeeded, ${failureCount} failed.`,
      type: failureCount > 0 ? "warning" : "success",
      metaData: { successCount, failureCount, errors, action },
    });
  } catch (notifErr) {
    console.error(
      "[bulkProcessActionsBackground] Failed to write completion notification:",
      notifErr,
    );
  }
};

/**
 * Administrative Service Methods for Workflow Definitions
 */
export const getAllWorkflowsService = async (queryParams) => {
  const { Workflow } = useModels();
  const { page = 1, limit = 10, search = "", sortBy, sortOrder } = queryParams;

  // ── Search Query ──────────────────────────────────────────────────────────
  const query = search
    ? {
        $or: [
          { description: { $regex: search, $options: "i" } },
          { transactionType: { $regex: search, $options: "i" } },
          { workflowCode: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1; // default
  }

  // ── Paginate ──────────────────────────────────────────────────────────────
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 10;

  return await Workflow.paginate(query, {
    page: pageNum,
    limit: limitNum,
    sort,
    populate: [
      { path: "initiatorRole", select: "description roleCode" },
      { path: "createdBy", select: "fullName" },
      { path: "updatedBy", select: "fullName" },
    ],
    select: "-WorkflowStage",
  });
};

//===========Get Workflow By Id===========

export const getWorkflowByIdService = async (id) => {
  const { Workflow } = useModels();
  const query = getLookupQuery(id, "workflowCode");
  const workflow = await Workflow.findOne(query)
    .populate("initiatorRole", "roleName wfRoleCode description")
    .populate(
      "WorkflowStage.stageApproverRole",
      "roleName wfRoleCode description",
    )
    .populate("WorkflowStage.specificApprovers", "fullName email")
    .populate("WorkflowStage.mandatoryFields.roleId", "roleName wfRoleCode")
    .populate("moduleContext", "subCode description")
    .populate("createdBy updatedBy", "fullName");
  if (!workflow) throw new ApiError(404, "Workflow not found");
  return workflow;
};

//===========Create Workflow===========

export const createWorkflowService = async (data) => {
  const { Workflow } = useModels();

  const {
    description,
    workflowType,
    transactionType,
    moduleContext,
    initiatorRole,
    WorkflowStage = [],
  } = data;

  // ── Mandatory Field Checks ────────────────────────────────────────────────
  if (!description) throw new ApiError(400, "Description is mandatory.");
  if (!transactionType)
    throw new ApiError(400, "Transaction Type is mandatory.");
  if (!initiatorRole) throw new ApiError(400, "Initiator Role is mandatory.");

  // ── At Least One Stage ────────────────────────────────────────────────────
  if (!WorkflowStage.length) {
    throw new ApiError(400, "Workflow must have at least one stage.");
  }

  // ── Duplicate Stage Names ─────────────────────────────────────────────────
  const stageNames = WorkflowStage.map((s) =>
    s.stageName?.trim().toLowerCase(),
  );
  if (stageNames.length !== new Set(stageNames).size) {
    throw new ApiError(400, "Each stage must have a unique name.");
  }

  // ── Duplicate Stage Numbers ───────────────────────────────────────────────
  const stageNumbers = WorkflowStage.map((s) => s.stageNumber);
  if (stageNumbers.length !== new Set(stageNumbers).size) {
    throw new ApiError(400, "Each stage must have a unique stage number.");
  }

  for (const stage of WorkflowStage) {
    if (!stage.stageName) {
      throw new ApiError(
        400,
        `Stage ${stage.stageNumber || "undefined"}: stageName is mandatory.`,
      );
    }
    if (!stage.stageNumber) {
      throw new ApiError(
        400,
        `Stage '${stage.stageName}': stageNumber is mandatory.`,
      );
    }

    // Non-notification stages must have an approver role or specific approver
    if (!stage.isNotificationOnly) {
      if (
        !stage.stageApproverRole &&
        (!stage.specificApprovers || stage.specificApprovers.length === 0) &&
        !stage.specificApprover
      ) {
        throw new ApiError(
          400,
          `Stage '${stage.stageName}': must have either a stageApproverRole or specificApprovers.`,
        );
      }
    }

    // Static stage must have a specificApprover
    if (
      stage.isStatic &&
      (!stage.specificApprovers || stage.specificApprovers.length === 0) &&
      !stage.specificApprover
    ) {
      throw new ApiError(
        400,
        `Stage '${stage.stageName}': static stages must have a specificApprover.`,
      );
    }

    // Amount range validation
    const min = parseFloat(stage.minAmount?.toString() || 0);
    const max = parseFloat(stage.maxAmount?.toString() || 0);
    if (max > 0 && min > max) {
      throw new ApiError(
        400,
        `Stage '${stage.stageName}': minAmount cannot be greater than maxAmount.`,
      );
    }

    // Notification recipients must have valid emails
    if (stage.notificationRecipients?.length) {
      for (const r of stage.notificationRecipients) {
        if (!r.email) {
          throw new ApiError(
            400,
            `Stage '${stage.stageName}': all notification recipients must have an email.`,
          );
        }
      }
    }
  }

  // ── Check Duplicate Workflow ──────────────────────────────────────────────
  const existing = await Workflow.findOne({
    transactionType,
    initiatorRole,
    isActive: true,
  });

  if (existing) {
    throw new ApiError(
      400,
      `An active workflow for '${transactionType}' with this initiator role already exists.`,
    );
  }

  // ── Create ────────────────────────────────────────────────────────────────
  const workflow = await Workflow.create({
    description,
    workflowType,
    transactionType,
    moduleContext,
    initiatorRole,
    WorkflowStage: WorkflowStage.sort((a, b) => a.stageNumber - b.stageNumber),
  });

  return workflow;
};

//===========Update Workflow===========

export const updateWorkflowService = async (id, data) => {
  const { Workflow } = useModels();

  const {
    description,
    workflowType,
    transactionType,
    moduleContext,
    initiatorRole,
    WorkflowStage = [],
  } = data;

  // ── Mandatory Field Checks ────────────────────────────────────────────────
  if (!description) throw new ApiError(400, "Description is mandatory.");
  if (!transactionType)
    throw new ApiError(400, "Transaction Type is mandatory.");
  if (!initiatorRole) throw new ApiError(400, "Initiator Role is mandatory.");

  // ── Find Existing ─────────────────────────────────────────────────────────
  const query = getLookupQuery(id, "workflowCode");
  const existingWorkflow = await Workflow.findOne(query);
  if (!existingWorkflow) throw new ApiError(404, "Workflow not found.");

  // ── Prevent Updating an Active/In-Use Workflow ────────────────────────────
  // Optional: uncomment if you want to lock active workflows from edits
  // if (existingWorkflow.isActive) {
  //   throw new ApiError(400, "Deactivate the workflow before editing.");
  // }

  // ── At Least One Stage ────────────────────────────────────────────────────
  if (!WorkflowStage.length) {
    throw new ApiError(400, "Workflow must have at least one stage.");
  }

  // ── Duplicate Stage Names ─────────────────────────────────────────────────
  const stageNames = WorkflowStage.map((s) =>
    s.stageName?.trim().toLowerCase(),
  );
  if (stageNames.length !== new Set(stageNames).size) {
    throw new ApiError(400, "Each stage must have a unique name.");
  }

  // ── Duplicate Stage Numbers ───────────────────────────────────────────────
  const stageNumbers = WorkflowStage.map((s) => s.stageNumber);
  if (stageNumbers.length !== new Set(stageNumbers).size) {
    throw new ApiError(400, "Each stage must have a unique stage number.");
  }

  // ── Stage-Level Validation ────────────────────────────────────────────────
  for (const stage of WorkflowStage) {
    if (!stage.stageName) {
      throw new ApiError(
        400,
        `Stage ${stage.stageNumber || "undefined"}: stageName is mandatory.`,
      );
    }
    if (!stage.stageNumber) {
      throw new ApiError(
        400,
        `Stage '${stage.stageName}': stageNumber is mandatory.`,
      );
    }

    if (!stage.isNotificationOnly) {
      if (
        !stage.stageApproverRole &&
        (!stage.specificApprovers || stage.specificApprovers.length === 0) &&
        !stage.specificApprover
      ) {
        throw new ApiError(
          400,
          `Stage '${stage.stageName}': must have either a stageApproverRole or specificApprovers.`,
        );
      }
    }

    if (
      stage.isStatic &&
      (!stage.specificApprovers || stage.specificApprovers.length === 0) &&
      !stage.specificApprover
    ) {
      throw new ApiError(
        400,
        `Stage '${stage.stageName}': static stages must have a specificApprover.`,
      );
    }

    const min = parseFloat(stage.minAmount || 0);
    const max = parseFloat(stage.maxAmount || 0);
    if (max > 0 && min > max) {
      throw new ApiError(
        400,
        `Stage '${stage.stageName}': minAmount cannot be greater than maxAmount.`,
      );
    }

    if (stage.notificationRecipients?.length) {
      for (const r of stage.notificationRecipients) {
        if (!r.email) {
          throw new ApiError(
            400,
            `Stage '${stage.stageName}': all notification recipients must have an email.`,
          );
        }
      }
    }
  }

  // ── Check Duplicate Workflow (excluding self) ─────────────────────────────
  const duplicate = await Workflow.findOne({
    transactionType,
    initiatorRole,
    isActive: true,
    _id: { $ne: existingWorkflow._id }, // exclude current doc
  });

  if (duplicate) {
    throw new ApiError(
      400,
      `Another active workflow for '${transactionType}' with this initiator role already exists.`,
    );
  }

  // ── Update ────────────────────────────────────────────────────────────────
  const updatedWorkflow = await Workflow.findByIdAndUpdate(
    existingWorkflow._id,
    {
      $set: {
        description,
        workflowType,
        transactionType,
        moduleContext,
        initiatorRole,
        WorkflowStage: WorkflowStage.sort(
          (a, b) => a.stageNumber - b.stageNumber,
        ),
      },
    },
    { new: true, runValidators: true },
  )
    .populate("initiatorRole", "roleName permissions")
    .populate("WorkflowStage.stageApproverRole", "roleName")
    .populate("WorkflowStage.specificApprovers", "fullName email")
    .populate("createdBy updatedBy", "fullName");

  return updatedWorkflow;
};

//===========Toggle Workflow Status===========

export const toggleWorkflowStatusService = async (id) => {
  const { Workflow } = useModels();
  const query = getLookupQuery(id, "workflowCode");
  const workflow = await Workflow.findOne(query)
    .populate("initiatorRole", "roleName permissions")
    .populate("WorkflowStage.stageApproverRole", "roleName")
    .populate("WorkflowStage.specificApprovers", "fullName email")
    .populate("createdBy updatedBy", "fullName");
  if (!workflow) throw new ApiError(404, "Workflow not found");

  workflow.isActive = !workflow.isActive;
  await workflow.save();

  return {
    updatedRecord: workflow,
    successMessage: `Workflow '${workflow.description}' is now ${workflow.isActive ? "Active" : "Inactive"}`,
  };
};

//===========Amend Workflow===========

export const amendWorkflowService = async (
  transactionId,
  transactionModel,
  userId,
) => {
  const { WorkflowState, WorkflowLog } = useModels();

  const session = await WorkflowState.db.startSession();
  session.startTransaction();

  try {
    const wfState = await _getWfState(
      WorkflowState,
      transactionId,
      transactionModel,
      session,
    );
    if (!wfState)
      throw new ApiError(404, "No workflow state found for this transaction.");

    // Only approved/completed transactions can be amended
    if (wfState.status !== "completed") {
      throw new ApiError(
        400,
        "Only fully approved transactions can be amended.",
      );
    }

    // 1. Reset workflow state
    wfState.status = "pending";
    wfState.currentStageNumber = 0; // Return to start
    await wfState.save({ session });

    // 2. Sync transaction status back to 'draft'
    await syncTransactionStatus(transactionModel, transactionId, "rejected", {
      session,
      userId,
    });

    // Note: We use 'rejected' sync logic because it moves status back to 'draft/rejected' in most models
    // Actually, let's ensure syncTransactionStatus handles 'draft' explicitly if needed.
    // For now, in syncTransactionStatus, 'rejected' sets transactionStatus = 'rejected'.
    // If we want it to be 'draft', we might need to update syncTransactionStatus.

    // 3. Log the amendment
    await WorkflowLog.create(
      [
        {
          transactionId,
          transactionModel: wfState.transactionModel,
          workflowId: wfState.workflowId,
          StageNo: 0,
          StageStatus: "amend",
          userId,
          comments: "Transaction amended for correction. Workflow reset.",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return wfState;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getWorkflowStateService = async (
  transactionId,
  transactionModel,
  userId,
) => {
  const { WorkflowState, Workflow, User } = useModels();

  try {
    if (!transactionId || !transactionModel) {
      return { status: "draft", currentStageName: "Draft", canAction: false };
    }

    const wfState = await _getWfState(
      WorkflowState,
      transactionId,
      transactionModel,
    );
    if (!wfState)
      return { status: "draft", currentStageName: "Draft", canAction: false };

    const workflow = await Workflow.findById(wfState.workflowId);
    if (!workflow)
      return {
        status: wfState.status,
        currentStageName: "Unknown",
        canAction: false,
      };

    const user = await User.findById(userId).populate("activeWorkflowRole");
    const currentStage = workflow.WorkflowStage.find(
      (s) => s.stageNumber === wfState.currentStageNumber,
    );

    let stageName = currentStage?.stageName || "Unknown Stage";
    if (wfState.status === "completed") stageName = "Approved";
    else if (wfState.status === "rejected") stageName = "Rejected";
    else if (wfState.status === "clarification_requested")
      stageName = "Clarification Needed";

    // Helper to get string ID
    const getStrId = (val) => val?._id?.toString() || val?.toString() || null;
    const userWfRoleId = getStrId(user?.activeWorkflowRole);

    let canAction = false;
    let canEdit = false;
    let isMatch = false;

    if (
      wfState.status === "pending" ||
      wfState.status === "clarification_requested"
    ) {
      if (wfState.delegatedTo) {
        isMatch = getStrId(wfState.delegatedTo) === userId.toString();
      } else if (currentStage?.isStatic) {
        isMatch = getStrId(currentStage.specificApprover) === userId.toString();
      } else {
        isMatch = userWfRoleId === getStrId(currentStage?.stageApproverRole);
      }

      if (isMatch) {
        const roleType = user?.activeWorkflowRole?.wfRoleType;
        if (roleType === "approver" || roleType === "admin") {
          canAction = true;
          canEdit = true;
        }
        if (wfState.status === "clarification_requested") canAction = true;
      }
    } else if (["draft", "rejected", "recalled"].includes(wfState.status)) {
      canEdit = true;
    }

    // Extract mandatory fields for this stage/role
    const mandatoryFields =
      currentStage?.mandatoryFields
        ?.filter(
          (f) =>
            !f.roleId ||
            f.roleId.toString() === user?.activeWorkflowRole?.toString(),
        )
        ?.map((f) => f.fieldName) || [];

    return {
      status: wfState.status,
      currentStageNumber: wfState.currentStageNumber,
      currentStageName: stageName,
      workflowId: wfState.workflowId,
      delegatedTo: wfState.delegatedTo,
      canAction,
      canApprove: canAction,
      canReject: canAction,
      canDelegate: canAction && user?.activeWorkflowRole?.canDelegate === true,
      canEdit,
      mandatoryFields,
    };
  } catch (err) {
    console.error("[WorkflowStateService] Error:", err);
    return { status: "draft", currentStageName: "Error", canAction: false };
  }
};

//===========Recall Workflow===========

export const recallWorkflowService = async (
  transactionId,
  transactionModel,
  userId,
) => {
  const { WorkflowState, WorkflowLog } = useModels();

  const session = await WorkflowState.db.startSession();
  session.startTransaction();

  try {
    const wfState = await _getWfState(
      WorkflowState,
      transactionId,
      transactionModel,
      session,
    );
    if (!wfState)
      throw new ApiError(404, "No workflow state found for this transaction.");

    if (wfState.status !== "pending") {
      throw new ApiError(400, "Only pending transactions can be recalled.");
    }

    // Verify initiator is the one recalling
    const submitLog = await WorkflowLog.findOne({
      transactionId,
      transactionModel,
      StageStatus: "submit",
    })
      .sort({ createdAt: 1 })
      .session(session);

    if (submitLog && submitLog.userId.toString() !== userId.toString()) {
      throw new ApiError(403, "Only the initiator can recall the workflow.");
    }

    // 1. Reset workflow state
    wfState.status = "recalled";
    await wfState.save({ session });

    // 2. Sync transaction status back to 'draft/recalled'
    await syncTransactionStatus(transactionModel, transactionId, "recalled", {
      session,
      userId,
    });

    // 3. Log the recall
    await WorkflowLog.create(
      [
        {
          transactionId,
          transactionModel: wfState.transactionModel,
          workflowId: wfState.workflowId,
          StageNo: wfState.currentStageNumber,
          StageStatus: "recalled", // assuming recalled is handled or mapped
          userId,
          comments: "Transaction recalled by initiator.",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return wfState;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

//===========Add Ad-Hoc Approver===========

export const addAdHocApproverService = async (
  transactionId,
  transactionModel,
  approverId,
  userId,
) => {
  const { WorkflowState, Workflow, WorkflowLog, User } = useModels();

  const session = await WorkflowState.db.startSession();
  session.startTransaction();

  try {
    const wfState = await _getWfState(
      WorkflowState,
      transactionId,
      transactionModel,
      session,
    );
    if (!wfState)
      throw new ApiError(404, "No workflow state found for this transaction.");

    if (wfState.status !== "pending") {
      throw new ApiError(
        400,
        "Can only add Ad-Hoc approver to pending transactions.",
      );
    }

    const workflow = await Workflow.findById(wfState.workflowId).session(
      session,
    );
    if (!workflow)
      throw new ApiError(404, "Linked Workflow template not found.");

    const newApprover = await User.findById(approverId);
    if (!newApprover) throw new ApiError(404, "Approver user not found.");

    if (wfState.delegatedTo) {
      throw new ApiError(
        400,
        "This stage is already delegated or has an ad-hoc approver.",
      );
    }

    wfState.delegatedTo = approverId;
    await wfState.save({ session });

    await WorkflowLog.create(
      [
        {
          transactionId,
          transactionModel: wfState.transactionModel,
          workflowId: wfState.workflowId,
          StageNo: wfState.currentStageNumber,
          StageStatus: "delegate", // Treat ad-hoc as delegation for now
          userId,
          comments: `Ad-Hoc approver added: ${newApprover.fullName}`,
        },
      ],
      { session },
    );

    setImmediate(() => {
      sendMappedEmail("WORKFLOW_DELEGATED", newApprover.email, {
        transactionId: transactionId.toString(),
        transactionModel,
        delegatedToName: newApprover.fullName,
        delegatedToEmail: newApprover.email,
        comments: `You have been added as an Ad-Hoc approver.`,
      });
    });

    await session.commitTransaction();
    return wfState;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
