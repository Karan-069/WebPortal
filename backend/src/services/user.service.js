import { ApiError } from "../utils/ApiError.js";
import { useModels, useTenantId } from "../utils/tenantContext.js";

/**
 * Helper to extract ID from string or object
 */
const extractId = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object") return val._id || val.id || null;
  return null;
};

/**
 * Register User
 */
const registerUserService = async (userData) => {
  const { User, UserRole, Department, WorkflowRole } = useModels();
  const {
    email,
    fullName,
    userRole,
    workflowRole,
    department,
    password,
    accessType,
  } = userData;

  if (
    [
      email,
      fullName,
      userRole,
      workflowRole,
      department,
      password,
      accessType,
    ].some(
      (field) =>
        field === null || field === undefined || String(field).trim() === "",
    )
  ) {
    throw new ApiError(400, "All Fields are Mandatory!!");
  }

  if (accessType !== "user") {
    throw new ApiError(400, "Access Type must be 'User'!!");
  }

  const checkEmail = await User.findOne({ email });

  if (checkEmail) {
    throw new ApiError(409, "User Already Exists with Email !!");
  }

  const [getUserRole, getDepartment, getWorkflowRole] = await Promise.all([
    UserRole.findById(userRole),
    Department.findById(department),
    WorkflowRole.findById(workflowRole),
  ]);

  if (!getUserRole || !getUserRole.isActive) {
    throw new ApiError(400, "User Role does not Exists or is InActive!!");
  }

  if (!getDepartment || !getDepartment.isActive) {
    throw new ApiError(400, "Department does not exits or is InActive !!");
  }

  if (!getWorkflowRole || !getWorkflowRole.isActive) {
    throw new ApiError(400, "Workflow Role does not exists or is InActive!!");
  }

  const newUser = await User.create({
    email,
    fullName,
    password,
    userRoles: [userRole],
    workflowRoles: [workflowRole],
    roleAssignments: [{ userRole, workflowRole }],
    defaultRoleAssignment: { userRole, workflowRole },
    activeRole: userRole,
    activeWorkflowRole: workflowRole,
    department,
    accessType,
  });

  const user = await User.findById(newUser._id)
    .select("-password -refreshToken")
    .lean();

  if (!user) {
    throw new ApiError(500, "An Error Occured while Registering User!!");
  }

  return user;
};

/**
 * Get User With Full Access (Role + Department + Workflow)
 */
const getUserWithAccess = async (userId) => {
  const { User } = useModels();
  const user = await User.findById(userId)
    .select("-password -refreshToken")
    .populate({
      path: "activeRole",
      select: "roleCode description menus isActive",
      populate: {
        path: "menus.menuId",
        select:
          "menuId description parentMenu sortOrder icon permissions isActive",
      },
    })
    .populate({
      path: "department",
      select: "departmentName isActive",
    })
    .populate({
      path: "activeWorkflowRole",
      select: "roleName approvalLevel isActive",
    })
    .populate({
      path: "userRoles",
      select: "roleCode description",
    })
    .populate({
      path: "workflowRoles",
      select: "roleName description",
    })
    .populate({
      path: "roleAssignments.userRole",
      select: "roleCode description",
    })
    .populate({
      path: "roleAssignments.workflowRole",
      select: "roleName wfRoleType",
    })
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Map activeRole to userRole for frontend compatibility
  user.userRole = user.activeRole;
  user.workflowRole = user.activeWorkflowRole;

  if (!user.activeRole?.isActive) {
    throw new ApiError(403, "Active user role inactive");
  }

  if (!user.department?.isActive) {
    throw new ApiError(403, "Department inactive");
  }

  if (!user.activeWorkflowRole?.isActive) {
    throw new ApiError(403, "Active workflow role inactive");
  }

  return user;
};

/**
 * Get Current User
 */
const getCurrentUserService = async (userId) => {
  return await getUserWithAccess(userId);
};

/**
 * Get All Users
 */
const getAllUsersService = async (query = {}) => {
  const { User } = useModels();
  const { page = 1, limit = 10, search = "" } = query;

  const findQuery = search
    ? {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.paginate(findQuery, {
    page: parseInt(page),
    limit: parseInt(limit),
    select: "-password -refreshToken",
    populate: [
      { path: "userRole", select: "roleName description" },
      { path: "department", select: "departmentName" },
      { path: "workflowRole", select: "roleName" },
    ],
    lean: true,
  });

  const { docs, ...pagination } = users;
  return { data: docs, pagination };
};

/**
 * Update User
 */
const updateUserService = async (userId, updateData) => {
  const { User, UserRole, Department, WorkflowRole } = useModels();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (updateData.userRole) {
    const role = await UserRole.findById(updateData.userRole);
    if (!role || !role.isActive) {
      throw new ApiError(400, "Invalid User Role");
    }
  }

  if (updateData.department) {
    const dept = await Department.findById(updateData.department);
    if (!dept || !dept.isActive) {
      throw new ApiError(400, "Invalid Department");
    }
  }

  if (updateData.workflowRole) {
    const wfRole = await WorkflowRole.findById(updateData.workflowRole);

    if (!wfRole || !wfRole.isActive) {
      throw new ApiError(400, "Invalid Workflow Role");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  })
    .select("-password -refreshToken")
    .lean();

  return updatedUser;
};

/**
 * Deactivate User
 */
const deactivateUserService = async (userId) => {
  const { User } = useModels();
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true },
  )
    .select("-password -refreshToken")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const logoutUserService = async (userId) => {
  const { User } = useModels();
  await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });

  return true;
};

const changePasswordService = async (userId, oldPassword, newPassword) => {
  const { User } = useModels();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Old password incorrect");
  }

  user.password = newPassword;

  await user.save();

  return true;
};

import { generateTokensService } from "./token.service.js";

/**
 * Switch User Role (Assignment-Driven)
 */
const switchRoleService = async (userId, roleId, workflowRoleId, roleCode) => {
  const { User, UserRole, WorkflowRole } = useModels();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Determine target role ID from either explicit ID or roleCode
  let targetRoleId = extractId(roleId);
  if (!targetRoleId && roleCode) {
    const roleRecord = await UserRole.findOne({ roleCode, isActive: true });
    if (roleRecord) {
      targetRoleId = roleRecord._id.toString();
    }
  }

  if (!targetRoleId) {
    throw new ApiError(400, "Requested role could not be identified");
  }

  // STRICTURE: Find the pairing assignment for this user role
  const assignment = (user.roleAssignments || []).find(
    (a) => a.userRole && a.userRole.toString() === targetRoleId.toString(),
  );

  if (!assignment) {
    throw new ApiError(
      403,
      "No valid role assignment found for this user role. Please contact administrator.",
    );
  }

  // Update synchronized active roles in-memory
  user.activeRole = assignment.userRole;
  user.activeWorkflowRole = assignment.workflowRole;

  // Generate tokens (this service handles the single, atomic .save() call)
  const { accessToken, refreshToken } = await generateTokensService(user);

  const populatedUser = await getUserWithAccess(user._id);

  return {
    user: populatedUser,
    accessToken,
    refreshToken,
    tenantId: useTenantId(),
  };
};

export {
  registerUserService,
  getUserWithAccess,
  getCurrentUserService,
  getAllUsersService,
  updateUserService,
  deactivateUserService,
  logoutUserService,
  changePasswordService,
  switchRoleService,
};
