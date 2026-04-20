import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import DashboardConfig from "../models/DashboardConfig.model.js";
import { Bill } from "../models/bill.model.js";
import { WorkflowLog } from "../models/workflowLogs.model.js";
import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";

export const getDashboardConfig = asyncHandler(async (req, res) => {
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

// Dynamic metrics dispatcher
export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const { metricId } = req.params;
  const { user } = req;

  let value = 0;
  let desc = "";

  try {
    switch (metricId) {
      // ─── Approver KPIs ───
      case "approver-pending":
        const wfLogs = await WorkflowLog.find({
          "assignedTo.user": user._id,
          status: "pending",
        });
        value = wfLogs.length;
        desc = "Awaiting your manual action";
        break;

      case "approver-approved-total":
        value = await Bill.countDocuments({ workflowStatus: "approved" });
        desc = "Total approved transactions";
        break;

      // ─── Vendor KPIs ───
      case "vendor-invoices":
        if (user.isVendor && user.vendorId) {
          value = await Bill.countDocuments({ vendorId: user.vendorId });
          desc = "Total uploaded invoices";
        }
        break;

      case "vendor-approved":
        if (user.isVendor && user.vendorId) {
          value = await Bill.countDocuments({
            vendorId: user.vendorId,
            workflowStatus: "approved",
          });
          desc = "Invoices approved for payment";
        }
        break;

      case "vendor-rejected":
        if (user.isVendor && user.vendorId) {
          value = await Bill.countDocuments({
            vendorId: user.vendorId,
            workflowStatus: "rejected",
          });
          desc = "Invoices requiring rework";
        }
        break;

      // ─── User KPIs ───
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
