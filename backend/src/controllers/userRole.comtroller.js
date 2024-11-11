import { UserRole } from "../models/userRole.model.js";
import { AppMenu } from "../models/appMenu.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

  const userRoles = await UserRole.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort,
    }
  );

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

const addUserRole = asyncHandler(async (req, res) => {
  const { roleCode, description, menus } = req.body;

  const existingUserRole = UserRole.findOne({});
  if (existingUserRole) {
    throw new ApiError(400, "User Role already Exists!!");
  }

  const menuIds = menus.map((menu) => menu.menuId);
  const validMenus = await AppMenu.find({ _id: { $in: menuIds } });
  if (validMenus.length !== menuIds.length) {
    throw new ApiError(400, "One or more menuIds are invalid.");
  }

  const createRole = await UserRole.create(roleCode, description, menus);

  //Return Response

  return res
    .status(201)
    .json(new ApiResponse(201, createRole, "User Role Sucessfully Created!!"));
});

export { getUserRole, addUserRole };
