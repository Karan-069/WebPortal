import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  registerUserService,
  getCurrentUserService,
  getAllUsersService,
  updateUserService,
  deactivateUserService,
  logoutUserService,
  changePasswordService,
} from "../services/user.service.js";

/**
 * Register User
 */
const registerUser = asyncHandler(async (req, res) => {
  const user = await registerUserService(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User Successfully Registered"));
});

/**
 * Get Current User
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getCurrentUserService(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

/**
 * Get All Users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsersService();

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

/**
 * Update User
 */
const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await updateUserService(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

/**
 * Deactivate User
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await deactivateUserService(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User deactivated successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await logoutUserService(req.user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await changePasswordService(req.user._id, oldPassword, newPassword);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

export {
  registerUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  logoutUser,
  changeUserPassword,
};
