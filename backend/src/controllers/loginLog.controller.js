import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getLoginLogsService,
  getLoginLogByIdService,
} from "../services/loginLog.service.js";

const getLoginLogs = asyncHandler(async (req, res) => {
  const result = await getLoginLogsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Fetched Successfully!!"));
});

const getLoginLogById = asyncHandler(async (req, res) => {
  const record = await getLoginLogByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, record, "Fetched Successfully!!"));
});

export { getLoginLogs, getLoginLogById };
