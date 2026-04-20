import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getMenusService } from "../services/appmenu.service.js";

const getMenus = asyncHandler(async (req, res) => {
  const { data, pagination } = await getMenusService(req.models, req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "App Menus Data Fetched Sucessfully!! ",
        pagination,
      ),
    );
});

export { getMenus };
