import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getWorkflowLogsService } from "../services/workflowLog.service.js";

const getAllWorkflowLogs = asyncHandler(async (req, res) => {
  const result = await getWorkflowLogsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Workflow logs fetched successfully"));
});

export { getAllWorkflowLogs };
