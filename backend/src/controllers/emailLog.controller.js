import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getEmailLogsService,
  getEmailLogByIdService,
} from "../services/emailLog.service.js";

export const getEmailLogs = asyncHandler(async (req, res) => {
  const result = await getEmailLogsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Email logs fetched successfully"));
});

export const getEmailLogById = asyncHandler(async (req, res) => {
  const result = await getEmailLogByIdService(req.params.id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Email log details fetched successfully"),
    );
});
