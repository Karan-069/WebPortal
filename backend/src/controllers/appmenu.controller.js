import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getMenusService,
  getMenuByIdService,
  getMyMenusService,
} from "../services/appmenu.service.js";

const getMenus = asyncHandler(async (req, res) => {
  const { docs, ...pagination } = await getMenusService(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        docs,
        "App Menus Data Fetched Successfully!!",
        pagination,
      ),
    );
});

const getMenuById = asyncHandler(async (req, res) => {
  const menu = await getMenuByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, menu, "App Menu fetched successfully"));
});

const getMyMenus = asyncHandler(async (req, res) => {
  const menus = await getMyMenusService(req.user, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, menus, "Authorized menus fetched successfully"));
});

export { getMenus, getMenuById, getMyMenus };
