import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";

const getAssetCategoriesService = async (query) => {
  const { AssetCategory } = useModels();
  const {
    page: requestedPage = 1,
    limit: requestedLimit = 50,
    sortBy,
    sortOrder,
  } = query;
  const pageNum = parseInt(requestedPage) > 0 ? parseInt(requestedPage) : 1;
  const limitNum = parseInt(requestedLimit) > 0 ? parseInt(requestedLimit) : 50;

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }
  const categoryData = await AssetCategory.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    },
  );

  const { docs, totalDocs, totalPages, page, limit } = categoryData;
  return { docs, totalDocs, totalPages, page, limit };
};

const addAssetCategoryService = async (body) => {
  const { AssetCategory } = useModels();
  const { catCode, description, parentCategoryId } = body;

  if (!catCode) {
    throw new ApiError(400, "Asset Category is Mandatory!!");
  }

  const checkCatCode = await AssetCategory.findOne({ catCode });

  if (checkCatCode) {
    throw new ApiError(401, "Asset Category alrady exists!!");
  }

  if (parentCategoryId) {
    const checkParentCategory = await AssetCategory.findById(parentCategoryId);

    if (!checkParentCategory) {
      throw new ApiError(400, "Invalid Parent Category!");
    }
  }

  const newAssetCategory = await AssetCategory.create({
    catCode,
    description,
    parentCategory: parentCategoryId,
  });

  return newAssetCategory;
};

const getAssetCategoryByIdService = async (catCode) => {
  const { AssetCategory } = useModels();
  //Check Category
  const categoryData = await AssetCategory.findOne({ catCode });
  if (!categoryData) {
    throw new ApiError(404, "Asset Category not Found!!");
  }
  return categoryData;
};

const updateAssetCategoryService = async (catCode, body) => {
  const { AssetCategory } = useModels();
  const { description, parentCategoryId } = body;

  const checkCatCode = await AssetCategory.findOne({ catCode });

  if (!checkCatCode) {
    throw new ApiError(404, "Asset Category not Found!!");
  }

  if (parentCategoryId) {
    const checkParentCategory = await AssetCategory.findById(parentCategoryId);

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
    { new: true, runValidators: true },
  );

  return updatedAssetCategory;
};

const toggleAssetCategoryStatusService = async (catCode) => {
  const { AssetCategory } = useModels();
  // Fetch and check if the Asset Category exists
  const checkCatCode = await AssetCategory.findOne({ catCode });
  if (!checkCatCode) {
    throw new ApiError(400, "Asset Category Not Found!!");
  }

  //Using Util to change status
  const { updatedRecord, successMessage } = await toggleStatus(
    AssetCategory,
    checkCatCode._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getAssetCategoriesService,
  addAssetCategoryService,
  getAssetCategoryByIdService,
  updateAssetCategoryService,
  toggleAssetCategoryStatusService,
};
