import { User } from "../models/user.model.js";
import { UserRole } from "../models/userRole.model.js";
import { Department } from "../models/department.model.js";
import { WorkflowRole } from "../models/workflowRole.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Register User
 */
const registerUserService = async (userData) => {
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
    userRole,
    department,
    workflowRole,
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
  const user = await User.findById(userId)
    .select("-password -refreshToken")
    .populate({
      path: "userRole",
      select: "roleName menuAccess permissions isActive",
    })
    .populate({
      path: "department",
      select: "departmentName isActive",
    })
    .populate({
      path: "workflowRole",
      select: "roleName approvalLevel isActive",
    })
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.userRole?.isActive) {
    throw new ApiError(403, "User role inactive");
  }

  if (!user.department?.isActive) {
    throw new ApiError(403, "Department inactive");
  }

  if (!user.workflowRole?.isActive) {
    throw new ApiError(403, "Workflow role inactive");
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
const getAllUsersService = async () => {
  return await User.find()
    .select("-password -refreshToken")
    .populate("userRole", "roleName")
    .populate("department", "departmentName")
    .populate("workflowRole", "roleName")
    .lean();
};

/**
 * Update User
 */
const updateUserService = async (userId, updateData) => {
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
  await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });

  return true;
};

const changePasswordService = async (userId, oldPassword, newPassword) => {
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

export {
  registerUserService,
  getUserWithAccess,
  getCurrentUserService,
  getAllUsersService,
  updateUserService,
  deactivateUserService,
  logoutUserService,
  changePasswordService,
};
