import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getUserRoleService,
  getUserRoleByIDService,
  addUserRoleService,
  updateUserRoleService,
  toggleUserRoleStatusService,
} from "../services/userRole.service.js";

const getUserRole = asyncHandler(async (req, res) => {
  const { data, pagination } = await getUserRoleService(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "User Roles Data Fetched Successfully!!",
        pagination,
      ),
    );
});

const getUserRoleByID = asyncHandler(async (req, res) => {
  const { roleCode } = req.params;
  const getUserRole = await getUserRoleByIDService(roleCode);

  return res
    .status(200)
    .json(
      new ApiResponse(200, getUserRole, "Single Role Fetched Successfully!!"),
    );
});

const addUserRole = asyncHandler(async (req, res) => {
  const createRole = await addUserRoleService(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, createRole, "User Role Sucessfully Created!!"));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { roleCode } = req.params;
  const updatedUserRole = await updateUserRoleService(roleCode, req.body);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUserRole, "User Role Sucessfully Updated!!"),
    );
});

const toggleUserRoleStatus = asyncHandler(async (req, res) => {
  const { roleCode } = req.params;
  const { updatedRecord, successMessage } =
    await toggleUserRoleStatusService(roleCode);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getUserRole,
  addUserRole,
  updateUserRole,
  getUserRoleByID,
  toggleUserRoleStatus,
};
