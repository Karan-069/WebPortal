import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getUserDelegationsService,
  getUserDelegationByIdService,
  addUserDelegationService,
  updateUserDelegationService,
  toggleUserDelegationStatusService,
} from "../services/userDelegation.service.js";

const getUserDelegations = asyncHandler(async (req, res) => {
  const result = await getUserDelegationsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Fetched Successfully!!"));
});

const getUserDelegationById = asyncHandler(async (req, res) => {
  const record = await getUserDelegationByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, record, "Fetched Successfully!!"));
});

const addUserDelegation = asyncHandler(async (req, res) => {
  const record = await addUserDelegationService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, record, "Created Successfully!!"));
});

const updateUserDelegation = asyncHandler(async (req, res) => {
  const record = await updateUserDelegationService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, record, "Updated Successfully!!"));
});

const toggleUserDelegationStatus = asyncHandler(async (req, res) => {
  const { updatedRecord, successMessage } =
    await toggleUserDelegationStatusService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getUserDelegations,
  getUserDelegationById,
  addUserDelegation,
  updateUserDelegation,
  toggleUserDelegationStatus,
};
