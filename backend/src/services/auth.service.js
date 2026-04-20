import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { useModels, useTenantId } from "../utils/tenantContext.js";
import { getUserWithAccess } from "./user.service.js";
import { generateTokensService } from "./token.service.js";

/**
 * Login User — returns fully populated user (with menus for sidebar)
 */
const loginUserService = async (email, password, traceData = {}) => {
  const { User, LoginLog } = useModels();
  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User is inactive");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    // Log failed attempt - Ensure we have a role ID to satisfy validation
    const fallbackRole =
      user.activeRole ||
      user.defaultRole ||
      (user.userRoles && user.userRoles[0]);

    if (fallbackRole) {
      await LoginLog.create({
        user: user._id,
        role: fallbackRole,
        ipAddress: traceData.ipAddress,
        userAgent: traceData.userAgent,
        status: "failed",
        failureReason: "Invalid credentials",
      });
    } else {
      console.error(`LoginLog failed: No role found for user ${user.email}`);
    }

    throw new ApiError(401, "Invalid credentials");
  }

  // Set active roles from assignment context
  const assignment = user.defaultRoleAssignment?.userRole
    ? user.defaultRoleAssignment
    : user.roleAssignments && user.roleAssignments[0];

  if (assignment) {
    user.activeRole = assignment.userRole;
    user.activeWorkflowRole = assignment.workflowRole;
  } else {
    // Ultimate fallback if no assignments exist (should be avoided in production)
    user.activeRole = user.userRoles?.[0];
    user.activeWorkflowRole = user.workflowRoles?.[0];
  }

  const tokens = await generateTokensService(user);

  // Record successful login
  await LoginLog.create({
    user: user._id,
    role: user.activeRole,
    ipAddress: traceData.ipAddress,
    userAgent: traceData.userAgent,
    status: "success",
  });

  // Return fully populated user so sidebar menus are available immediately
  const populatedUser = await getUserWithAccess(user._id);

  return {
    user: populatedUser,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tenantId: useTenantId(),
  };
};

/**
 * Refresh Access Token — also returns updated user data
 */
const refreshAccessTokenService = async (refreshToken) => {
  const { User } = useModels();
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
  } catch (error) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  const user = await User.findById(decoded._id);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User inactive");
  }

  if (user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Refresh token expired or already used");
  }

  const tokens = await generateTokensService(user);

  // Return populated user alongside new tokens
  const populatedUser = await getUserWithAccess(user._id);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: populatedUser,
    tenantId: useTenantId(),
  };
};

export { generateTokensService, loginUserService, refreshAccessTokenService };
