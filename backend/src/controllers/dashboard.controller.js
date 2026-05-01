import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { useModels } from "../utils/tenantContext.js";
import {
  getDashboardConfigsService,
  addDashboardConfigService,
  getDashboardConfigByIdService,
  updateDashboardConfigService,
  deleteDashboardConfigService,
} from "../services/dashboardConfig.service.js";

export const getDashboardConfig = asyncHandler(async (req, res) => {
  const { DashboardConfig } = useModels();
  const { user } = req;
  let targetRole = "default";

  if (user.isVendor) {
    targetRole = "vendor";
  } else if (user.userRole?.name) {
    const roleName = user.userRole.name.toLowerCase();
    // Broad categorization based on typical role names
    if (roleName.includes("admin")) targetRole = "admin";
    else if (roleName.includes("approver") || roleName.includes("manager"))
      targetRole = "approver";
    else targetRole = "user";
  }

  // Fallback to default if not found
  let config = await DashboardConfig.findOne({ roleName: targetRole });
  if (!config) {
    config = await DashboardConfig.findOne({ roleName: "default" });
  }

  if (!config) {
    return res
      .status(200)
      .json(new ApiResponse(200, { layout: [] }, "No dashboard config found"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        config,
        "Dashboard configuration fetched successfully",
      ),
    );
});

// ─── Dashboard Layouts CRUD ───

export const getDashboardLayouts = asyncHandler(async (req, res) => {
  const result = await getDashboardConfigsService(req.query);
  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Dashboard layouts fetched successfully"),
    );
});

export const addDashboardLayout = asyncHandler(async (req, res) => {
  const result = await addDashboardConfigService(req.body);
  return res
    .status(201)
    .json(
      new ApiResponse(201, result, "Dashboard layout created successfully"),
    );
});

export const getDashboardLayoutById = asyncHandler(async (req, res) => {
  const result = await getDashboardConfigByIdService(req.params.id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Dashboard layout fetched successfully"),
    );
});

export const updateDashboardLayout = asyncHandler(async (req, res) => {
  const result = await updateDashboardConfigService(req.params.id, req.body);
  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Dashboard layout updated successfully"),
    );
});

export const deleteDashboardLayout = asyncHandler(async (req, res) => {
  await deleteDashboardConfigService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Dashboard layout deleted successfully"));
});

// Dynamic metrics dispatcher
export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const { WorkflowState, Bill, WorkflowLog, Workflow, User, Vendor } =
    useModels();
  const { metricId } = req.params;
  const { user } = req;

  let value = 0;
  let desc = "";

  try {
    switch (metricId) {
      // ─── Approver KPIs ───
      case "approver-pending": {
        // Find all WorkflowStates where status is pending and the user has the required workflow role
        const wfRoles = user.workflowRoles || [];
        const states = await WorkflowState.find({ status: "pending" }).populate(
          "workflowId",
        );

        // Filter states where current stage approver role matches one of user's roles
        const pendingCount = states.filter((s) => {
          const currentStage = s.workflowId?.WorkflowStage?.find(
            (st) => st.stageNumber === s.currentStageNumber,
          );
          return (
            currentStage &&
            wfRoles.some(
              (r) =>
                r.toString() === currentStage.stageApproverRole?.toString(),
            )
          );
        }).length;

        value = pendingCount;
        desc = "Records awaiting your decision";
        break;
      }

      case "approver-clarification-received": {
        // Logs with 'clarification_provided' where user is an approver for that record
        const wfRoles = user.workflowRoles || [];
        const logs = await WorkflowLog.find({
          StageStatus: "clarification_provided",
        })
          .sort({ createdAt: -1 })
          .limit(100);

        // Check if user is an approver for these records
        let count = 0;
        for (const log of logs) {
          const state = await WorkflowState.findOne({
            transactionId: log.transactionId,
          });
          if (state) {
            const workflow = await Workflow.findById(state.workflowId);
            const currentStage = workflow?.WorkflowStage?.find(
              (st) => st.stageNumber === state.currentStageNumber,
            );
            if (
              currentStage &&
              wfRoles.some(
                (r) =>
                  r.toString() === currentStage.stageApproverRole?.toString(),
              )
            ) {
              count++;
            }
          }
        }
        value = count;
        desc = "Recent updates from initiators";
        break;
      }

      case "approver-approved-total":
        value = await Bill.countDocuments({ workflowStatus: "approved" });
        desc = "Total approved transactions";
        break;

      // ─── User KPIs ───
      case "user-clarification-required":
        // Records where status is clarification_requested and user is creator
        const billIds = await Bill.find({ createdBy: user._id }).distinct(
          "_id",
        );
        value = await WorkflowState.countDocuments({
          transactionId: { $in: billIds },
          status: "clarification_requested",
        });
        desc = "Information requested from you";
        break;

      case "user-drafts":
        value = await Bill.countDocuments({
          createdBy: user._id,
          transactionStatus: "draft",
        });
        desc = "Your saved drafts";
        break;

      case "user-submitted":
        value = await Bill.countDocuments({
          createdBy: user._id,
          transactionStatus: { $ne: "draft" },
        });
        desc = "Transactions submitted by you";
        break;

      case "user-rejected":
        const myBills = await Bill.find({ createdBy: user._id }).distinct(
          "_id",
        );
        value = await WorkflowState.countDocuments({
          transactionId: { $in: myBills },
          status: "rejected",
        });
        desc = "Transactions needing rework";
        break;

      // ─── Admin KPIs ───
      case "admin-total-bills":
        value = await Bill.countDocuments();
        desc = "Total bills in the system";
        break;

      case "admin-total-users":
        value = await User.countDocuments({ isActive: true });
        desc = "Total active system users";
        break;

      case "admin-total-vendors":
        value = await Vendor.countDocuments({ isActive: true });
        desc = "Total registered vendors";
        break;

      default:
        value = 0;
        desc = "Metric not found";
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, { value, desc }, "Metric fetched successfully"),
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          { value: 0, desc: "Error loading metric" },
          error.message,
        ),
      );
  }
});
