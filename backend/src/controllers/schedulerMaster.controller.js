import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getSchedulerMastersService,
  getSchedulerMasterByIdService,
  addSchedulerMasterService,
  updateSchedulerMasterService,
  toggleSchedulerMasterStatusService,
} from "../services/schedulerMaster.service.js";

const getSchedulerMasters = asyncHandler(async (req, res) => {
  const result = await getSchedulerMastersService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Fetched Successfully!!"));
});

const getSchedulerMasterById = asyncHandler(async (req, res) => {
  const record = await getSchedulerMasterByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, record, "Fetched Successfully!!"));
});

const addSchedulerMaster = asyncHandler(async (req, res) => {
  const record = await addSchedulerMasterService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, record, "Created Successfully!!"));
});

const updateSchedulerMaster = asyncHandler(async (req, res) => {
  const record = await updateSchedulerMasterService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, record, "Updated Successfully!!"));
});

const toggleSchedulerMasterStatus = asyncHandler(async (req, res) => {
  const { updatedRecord, successMessage } =
    await toggleSchedulerMasterStatusService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getSchedulerMasters,
  getSchedulerMasterById,
  addSchedulerMaster,
  updateSchedulerMaster,
  toggleSchedulerMasterStatus,
};
