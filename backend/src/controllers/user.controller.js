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
  resetUserPasswordService,
  switchRoleService,
} from "../services/user.service.js";

import {
  loginUserService,
  refreshAccessTokenService,
} from "../services/auth.service.js";

/**
 * Login User
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];

  const { user, accessToken, refreshToken } = await loginUserService(
    email,
    password,
    { ipAddress, userAgent },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "Login successful",
      ),
    );
});

/**
 * Refresh Access Token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  const {
    accessToken,
    refreshToken: newRefreshToken,
    user,
  } = await refreshAccessTokenService(incomingRefreshToken);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken, user },
        "Token refreshed",
      ),
    );
});

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
  const userId = req.params.id || req.user._id;
  const user = await getCurrentUserService(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User data fetched successfully"));
});

/**
 * Get All Users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsersService(req.query);
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

/**
 * Logout User
 */
const logoutUser = asyncHandler(async (req, res) => {
  await logoutUserService(req.user._id);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };
  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

/**
 * Change Password
 */
const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await changePasswordService(req.user._id, oldPassword, newPassword);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

/**
 * Admin: Reset User Password
 */
const resetUserPassword = asyncHandler(async (req, res) => {
  const { userId, tempPassword } = req.body;
  await resetUserPasswordService(userId, tempPassword);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "User password reset successfully. User will be forced to change it on next login.",
      ),
    );
});

/**
 * Switch User Role
 */
const switchRole = asyncHandler(async (req, res) => {
  try {
    const { roleId, workflowRoleId, roleCode } = req.body;
    const { user, accessToken, refreshToken, tenantId } =
      await switchRoleService(req.user._id, roleId, workflowRoleId, roleCode);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { user, accessToken, refreshToken, tenantId },
          "Role switched successfully",
        ),
      );
  } catch (error) {
    // Definitive logging to catch the reason for 500
    console.error("FATAL_SWITCH_ROLE_ERROR:", error);
    // Log to a specific file to ensure we can read it
    await import("fs").then((fs) => {
      fs.appendFileSync(
        "debug_error.log",
        `\n[${new Date().toISOString()}] SWITCH_ROLE ERROR: ${error.message}\nStack: ${error.stack}\n`,
      );
    });
    throw error;
  }
});

export {
  loginUser,
  refreshToken,
  registerUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  logoutUser,
  changeUserPassword,
  resetUserPassword,
  switchRole,
};
