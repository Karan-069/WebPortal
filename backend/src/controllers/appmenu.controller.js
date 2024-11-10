import { asyncHandler } from "../utils/asyncHandler.js";
import { AppMenu } from "../models/appMenu.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getMenus = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query; // Get queries with defaults for page and limit

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }

  const existingMenus = await AppMenu.paginate(
    {},
    {
      page: pageNum, //
      limit: limitNum,
      sort: sort,
    }
  );

  //Return Respose
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingMenus.docs,
        "App Menus Data Fetched Sucessfully!! "
      )
    );
});

export { getMenus };
