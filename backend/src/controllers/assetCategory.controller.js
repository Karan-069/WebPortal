import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getAssetCategoriesService,
  addAssetCategoryService,
  getAssetCategoryByIdService,
  updateAssetCategoryService,
  toggleAssetCategoryStatusService,
} from "../services/assetCategory.service.js";

const getAssetCategories = asyncHandler(async (req, res) => {
  const result = await getAssetCategoriesService(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Asset Categories fetched Successfully!!"),
    );
});

const addAssetCategory = asyncHandler(async (req, res) => {
  const newAssetCategory = await addAssetCategoryService(req.body);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newAssetCategory,
        "Asset Category Succefully Created!",
      ),
    );
});

const getAssetCategoryById = asyncHandler(async (req, res) => {
  const { catCode } = req.params;
  const categoryData = await getAssetCategoryByIdService(catCode);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categoryData,
        "Asset Category Data Successfully Feteched!!",
      ),
    );
});

const updateAssetCategory = asyncHandler(async (req, res) => {
  const { catCode } = req.params;
  const updatedAssetCategory = await updateAssetCategoryService(
    catCode,
    req.body,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedAssetCategory,
        "Asset Category Updated Successfully!!",
      ),
    );
});

const toggleAssetCategoryStatus = asyncHandler(async (req, res) => {
  const { catCode } = req.params;
  const { updatedRecord, successMessage } =
    await toggleAssetCategoryStatusService(catCode);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getAssetCategories,
  addAssetCategory,
  getAssetCategoryById,
  updateAssetCategory,
  toggleAssetCategoryStatus,
};
