import { asyncHandler } from "../utils/asyncHandler";
import { AssetCategory } from "../models/assetCategory.model";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

const getAssetCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query;

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }
  const assetCategories = await AssetCategory.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    }
  );

  const assetCategoryPaginateData = { ...assetCategories };
  delete assetCategoryPaginateData.docs;

  // Return the paginated response

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assetCategories.docs,
        "Asset Categories fetched Successfully!!",
        assetCategoryPaginateData
      )
    );
});

const addAssetCategory = asyncHandler(async (req, res) => {
  const { catCode, description, parentCategoryId } = req.body;

  if (!catCode) {
    throw new ApiError(400, "Asset Category is Mandatory!!");
  }

  const checkCatCode = await AssetCategory.findOne({ catCode });

  if (checkCatCode) {
    throw new ApiError(401, "Asset Category alrady exists!!");
  }

  if (parentCategoryId) {
    const checkParentCategory = await AssetCategory.findById({
      parentCategoryId,
    });

    if (!checkParentCategory) {
      throw new ApiError(400, "Invalid Parent Category!");
    }
  }

  const newAssetCategory = await AssetCategory.create({
    catCode,
    description,
    parentCategory: parentCategoryId,
  });

  //Return Response

  return res
    .statu(201)
    .json(
      new ApiResponse(
        201,
        newAssetCategory,
        "Asset Category Succefully Created!"
      )
    );
});

// GET Asset Category by ID Logic
const getAssetCategoryById = asyncHandler(async (req, res) => {
  const { catCode } = req.params;

  //Check Category
  const categoryData = await AssetCategory.findOne({ catCode });
  if (categoryData.length === 0) {
    throw new ApiError(404, "Asset Category not Found!!");
  }

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categoryData,
        "Asset Category Data Successfully Feteched!!"
      )
    );
});

const updateAssetCategory = asyncHandler(async (req, res) => {
  const { catCode } = req.params;
  const { description, parentCategoryId } = req.body;

  const checkCatCode = await AssetCategory.findOne({ catCode });

  if (!checkCatCode) {
    throw new ApiError(404, "Asset Category not Found!!");
  }

  if (parentCategoryId) {
    const checkParentCategory = await AssetCategory.findById({
      parentCategoryId,
    });

    if (!checkParentCategory) {
      throw new ApiError(400, "Invalid Parent Category!");
    }
  }

  const updatedFields = {};

  updatedFields.description = description;
  updatedFields.parentCategory = parentCategoryId;

  const updatedAssetCategory = await AssetCategory.findByIdAndUpdate(
    checkCatCode._id,
    { $set: updatedFields },
    { new: true, runValidators: true }
  );

  //Return
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedAssetCategory,
        "Asset Category Updated Successfully!!"
      )
    );
});

// Deactive Asset Category Logic
const toggleAssetCategoryStatus = asyncHandler(async (req, res) => {
  const { catCode } = req.params;

  // Fetch and check if the Asset Category exists
  const checkCatCode = await AssetCategory.findOne({ catCode });
  if (!checkCatCode) {
    throw new ApiError(400, "Asset Category Not Found!!");
  }

  //Using Util to change status
  const { updatedRecord, successMessage } = await toggleStatus(
    AssetCategory,
    checkCatCode._id
  );

  //Return RES
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
