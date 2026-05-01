import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getSchedulerLogsService,
  getSchedulerLogByIdService,
  addSchedulerLogService,
  updateSchedulerLogService,
  toggleSchedulerLogStatusService,
} from "../services/schedulerLog.service.js";

const getSchedulerLogs = asyncHandler(async (req, res) => {
  const result = await getSchedulerLogsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Fetched Successfully!!"));
});

const getSchedulerLogById = asyncHandler(async (req, res) => {
  const record = await getSchedulerLogByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, record, "Fetched Successfully!!"));
});

const addSchedulerLog = asyncHandler(async (req, res) => {
  const record = await addSchedulerLogService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, record, "Created Successfully!!"));
});

const updateSchedulerLog = asyncHandler(async (req, res) => {
  const record = await updateSchedulerLogService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, record, "Updated Successfully!!"));
});

const toggleSchedulerLogStatus = asyncHandler(async (req, res) => {
  const { updatedRecord, successMessage } =
    await toggleSchedulerLogStatusService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getSchedulerLogs,
  getSchedulerLogById,
  addSchedulerLog,
  updateSchedulerLog,
  toggleSchedulerLogStatus,
};
