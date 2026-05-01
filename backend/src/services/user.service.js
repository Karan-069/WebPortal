import { ApiError } from "../utils/ApiError.js";
import { useModels, useTenantId } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";
import { enrichWithWorkflowState } from "../utils/workflowHelper.js";

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
    roleAssignments = [],
  } = userData;

  if (
    [email, fullName, userRole, workflowRole, password, accessType].some(
      (field) =>
        field === null || field === undefined || String(field).trim() === "",
    )
  ) {
    throw new ApiError(400, "All Fields are Mandatory!!");
  }

  // Handle department optionality for vendors
  if (accessType === "user" && !department) {
    throw new ApiError(400, "Department is Mandatory for System Users!!");
  }

  const checkEmail = await User.findOne({ email });

  if (checkEmail) {
    throw new ApiError(409, "User Already Exists with Email !!");
  }

  const uRoleId = extractId(userRole);
  const wRoleId = extractId(workflowRole);
  const deptId = extractId(department);

  const [getUserRole, getDepartment, getWorkflowRole] = await Promise.all([
    UserRole.findById(uRoleId),
    deptId ? Department.findById(deptId) : Promise.resolve(null),
    WorkflowRole.findById(wRoleId),
  ]);

  if (!getUserRole || !getUserRole.isActive) {
    throw new ApiError(400, "User Role does not Exists or is InActive!!");
  }

  if (department && (!getDepartment || !getDepartment.isActive)) {
    throw new ApiError(400, "Department does not exits or is InActive !!");
  }

  if (!getWorkflowRole || !getWorkflowRole.isActive) {
    throw new ApiError(400, "Workflow Role does not exists or is InActive!!");
  }

  // Ensure default role is in assignments
  let finalAssignments = [...roleAssignments];
  const hasDefault = finalAssignments.some((a) => a.isDefault);

  if (!hasDefault) {
    // If no default marked in array, use the top-level selection as default
    finalAssignments.push({ userRole, workflowRole, isDefault: true });
  }

  const defaultAssignment = finalAssignments.find((a) => a.isDefault) || {
    userRole,
    workflowRole,
  };

  const newUser = await User.create({
    email,
    fullName,
    password,
    roleAssignments: finalAssignments.map((a) => ({
      userRole: extractId(a.userRole),
      workflowRole: extractId(a.workflowRole),
      isDefault: !!a.isDefault,
    })),
    defaultRoleAssignment: {
      userRole: extractId(defaultAssignment.userRole),
      workflowRole: extractId(defaultAssignment.workflowRole),
    },
    activeRole: extractId(defaultAssignment.userRole),
    activeWorkflowRole: extractId(defaultAssignment.workflowRole),
    department: deptId,
    accessType,
  });

  return await getUserWithAccess(newUser._id);
};

/**
 * Get User With Full Access (Role + Department + Workflow)
 */
const getUserWithAccess = async (userId) => {
  const { User } = useModels();
  const query = getLookupQuery(userId, "userCode");
  const user = await User.findOne(query)
    .select("-password -refreshToken")
    .populate("createdBy updatedBy", "fullName")
    .populate({
      path: "activeRole",
      select: "roleCode description menus isActive",
      populate: {
        path: "menus.menuId",
        select:
          "menuId description parentMenu sortOrder icon menuLevel menuType permissions isActive",
      },
    })
    .populate({
      path: "department",
      select: "departmentName isActive description deptCode",
    })
    .populate({
      path: "activeWorkflowRole",
      select: "wfRoleCode roleName wfRoleType canDelegate isActive",
    })
    .populate({
      path: "defaultRoleAssignment.userRole",
      select: "roleCode description menus isActive",
      populate: {
        path: "menus.menuId",
        select:
          "menuId description parentMenu sortOrder icon menuLevel menuType permissions isActive",
      },
    })
    .populate({
      path: "defaultRoleAssignment.workflowRole",
      select: "wfRoleCode roleName wfRoleType canDelegate",
    })
    .populate({
      path: "roleAssignments.userRole",
      select: "roleCode description",
    })
    .populate({
      path: "roleAssignments.workflowRole",
      select: "wfRoleCode roleName wfRoleType canDelegate",
    })
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Map for frontend form compatibility
  // In management forms, userRole/workflowRole usually refer to the DEFAULT assignment
  user.userRole = user.activeRole || user.defaultRoleAssignment?.userRole;
  user.workflowRole =
    user.defaultRoleAssignment?.workflowRole || user.activeWorkflowRole;

  if (user.activeRole && !user.activeRole?.isActive) {
    // console.warn("Active user role inactive");
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
          { userCode: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.paginate(findQuery, {
    page: parseInt(page),
    limit: parseInt(limit),
    select: "-password -refreshToken",
    populate: [
      { path: "activeRole", select: "roleCode description" },
      { path: "department", select: "deptCode description" },
      { path: "activeWorkflowRole", select: "wfRoleCode roleName canDelegate" },
      {
        path: "defaultRoleAssignment.userRole",
        select: "roleCode description",
      },
      {
        path: "defaultRoleAssignment.workflowRole",
        select: "wfRoleCode roleName canDelegate",
      },
      { path: "roleAssignments.userRole", select: "roleCode description" },
      { path: "roleAssignments.workflowRole", select: "wfRoleCode roleName" },
      { path: "createdBy updatedBy", select: "fullName" },
    ],
    lean: true,
  });

  const { docs, ...pagination } = users;

  // Map back to singular keys for frontend compatibility
  const mappedDocs = docs.map((u) => {
    // Priority: Default Assignment > Active Role > First Assignment
    const defaultAssignment = u.defaultRoleAssignment || {};
    const fallbackAssignment =
      (u.roleAssignments && u.roleAssignments[0]) || {};

    return {
      ...u,
      userRole:
        defaultAssignment.userRole ||
        u.activeRole ||
        fallbackAssignment.userRole,
      workflowRole:
        defaultAssignment.workflowRole ||
        u.activeWorkflowRole ||
        fallbackAssignment.workflowRole,
    };
  });

  const enrichedDocs = await enrichWithWorkflowState(mappedDocs, "User");
  return { docs: enrichedDocs, ...pagination };
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

  // Handle Role Mapping synchronization
  if (updateData.roleAssignments) {
    const defaultAssign = updateData.roleAssignments.find((a) => a.isDefault);
    if (defaultAssign) {
      const uRoleId = extractId(defaultAssign.userRole);
      const wRoleId = extractId(defaultAssign.workflowRole);

      updateData.userRole = uRoleId;
      updateData.workflowRole = wRoleId;
      updateData.activeRole = uRoleId;
      updateData.activeWorkflowRole = wRoleId;
      updateData.defaultRoleAssignment = {
        userRole: uRoleId,
        workflowRole: wRoleId,
      };
    }
  } else if (updateData.userRole && updateData.workflowRole) {
    // Top-level update from simplified forms
    const uRoleId = extractId(updateData.userRole);
    const wRoleId = extractId(updateData.workflowRole);

    updateData.userRole = uRoleId;
    updateData.workflowRole = wRoleId;
    updateData.activeRole = uRoleId;
    updateData.activeWorkflowRole = wRoleId;
    updateData.defaultRoleAssignment = {
      userRole: uRoleId,
      workflowRole: wRoleId,
    };

    // Ensure this role is in assignments
    const hasAssign = (user.roleAssignments || []).some(
      (a) =>
        a.userRole?.toString() === updateData.userRole?.toString() &&
        a.workflowRole?.toString() === updateData.workflowRole?.toString(),
    );

    if (!hasAssign) {
      updateData.$push = {
        roleAssignments: {
          userRole: updateData.userRole,
          workflowRole: updateData.workflowRole,
        },
      };
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  return await getUserWithAccess(updatedUser._id);
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
  user.mustChangePassword = false;

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
    console.error(
      `[SwitchRole] No assignment found for User:${userId} and Role:${targetRoleId}. Assignments:`,
      user.roleAssignments,
    );
    throw new ApiError(
      403,
      `Unauthorized: You do not have a valid assignment for the requested role (${targetRoleId}). Please contact your administrator.`,
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

/**
 * Reset User Password (Admin Initiated)
 */
const resetUserPasswordService = async (userId, tempPassword) => {
  const { User } = useModels();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = tempPassword;
  user.mustChangePassword = true;

  await user.save();

  return true;
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
  resetUserPasswordService,
  switchRoleService,
};
