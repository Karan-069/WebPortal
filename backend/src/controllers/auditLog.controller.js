import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAuditLogsService } from "../services/auditLog.service.js";

/**
 * Get Audit Logs Controller
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await getAuditLogsService(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, logs, "Audit logs fetched successfully"));
});

export const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { getAuditLogByIdService } =
    await import("../services/auditLog.service.js");
  const log = await getAuditLogByIdService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, log, "Audit log fetched successfully"));
});
