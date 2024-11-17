import { UserRole } from "../models/userRole.model.js";
import { AppMenu } from "../models/appMenu.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { toggleStatus } from "../utils/toggleStatus.js";

//GET all Users Logic
const getUserRole = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query; // Get queries with defaults for page and limit

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }

  //DB query
  const userRoles = await UserRole.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort,
    }
  );

  //Populate Each MenusIds
  for (let userRole of userRoles.docs) {
    await userRole.PopulateMenus();
  }
  const paginationData = { ...userRoles }; // Create a shallow copy
  delete paginationData.docs;

  //Return respose
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userRoles.docs,
        "User Roles Data Fetched Successfully!!",
        paginationData
      )
    );
});

// GET User by ID Logic
const getUserRoleByID = asyncHandler(async (req, res) => {
  const { roleCode } = req.params;

  // Check RoleCode
  const getUserRole = await UserRole.findOne({ roleCode });
  if (!getUserRole) {
    throw new ApiError(404, "User Role not Found!!");
  }

  // Populate MenusIds
  await getUserRole.PopulateMenus();

  return res
    .status(200)
    .json(
      new ApiResponse(200, getUserRole, "Single Role Fetched Successfully!!")
    );
});

// ADD User Logic
const addUserRole = asyncHandler(async (req, res) => {
  const { roleCode, description, menus } = req.body;

  if (!roleCode) {
    throw new ApiError(400, "Role Code is Madatory!!");
  }

  //Check exisitng Code
  const existingUserRole = await UserRole.findOne({ roleCode: roleCode });
  if (existingUserRole) {
    throw new ApiError(400, "User Role already Exists!!");
  }

  //Create map extract menuId
  const menuIds = menus.map((menus) => menus.menuId);

  //Check extracted in AppMenus
  const validMenus = await AppMenu.find({ _id: { $in: menuIds } });
  if (validMenus.length !== menuIds.length) {
    throw new ApiError(400, "One or more Menus are invalid!!");
  }

  //Create User Role
  const createRole = await UserRole.create({ roleCode, description, menus });

  //Populate MenuIDs
  await createRole.PopulateMenus();

  //Return Response

  return res
    .status(201)
    .json(new ApiResponse(201, createRole, "User Role Sucessfully Created!!"));
});

// UPDATE User by ID Logic
const updateUserRole = asyncHandler(async (req, res) => {
  const { roleCode } = req.params;
  const { description, menus } = req.body;

  //Check Duplicate RoleCode
  const existingUserRole = await UserRole.findOne({ roleCode });
  if (!existingUserRole) {
    throw new ApiError(400, "User Role does not Exists!!");
  }
  // console.log(menus);

  //Validate MenuId
  const invalidMenuIds = menus.filter(
    (menu) => !mongoose.Types.ObjectId.isValid(menu.menuId)
  );
  if (invalidMenuIds.length > 0) {
    throw new ApiError(
      400,
      "One or more Menu IDs are not in Valid MenuId Format!!"
    );
  }

  //Creating MenuId Map by extracting from menus
  const menuIds = menus.map((menus) => menus.menuId);

  // Validating extracted MenusIds
  const validMenus = await AppMenu.find({
    _id: {
      $in: menuIds,
    },
  });
  if (validMenus.length !== menuIds.length) {
    throw new ApiError(400, "One or more Menus are Invalid!!");
  }

  //Update Data in DB
  const updatedUserRole = await UserRole.findByIdAndUpdate(
    existingUserRole.id,
    {
      $set: {
        description,
        menus,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedUserRole) {
    throw new ApiError(500, "Failed Updating User Role!!");
  }

  //Return Res
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUserRole, "User Role Sucessfully Updated!!")
    );
});

const toggleUserRoleStatus = asyncHandler(async (req, res) => {
  const { roleCode } = req.params;

  const existingUserRole = await UserRole.findOne({ roleCode });
  if (!existingUserRole) {
    throw new ApiError(400, "Invalid User Role!!");
  }

  //Update Status
  const { updatedRecord, successMessage } = await toggleStatus(
    UserRole,
    existingUserRole._id
  );

  //Return RES
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
