import { ApiError } from "../utils/ApiError.js";
import { useModels } from "../utils/tenantContext.js";

const getAssetsService = async (queryParams) => {
  const { Asset } = useModels();
  const { page = 1, limit = 10, search = "" } = queryParams;

  const query = search
    ? {
        $or: [
          { assetName: { $regex: search, $options: "i" } },
          { assetTag: { $regex: search, $options: "i" } },
          { serialNumber: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  return await Asset.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: "assetCategory", select: "description" },
      { path: "location", select: "description" },
      { path: "department", select: "description" },
    ],
  });
};

const getAssetByIdService = async (id) => {
  const { Asset } = useModels();
  const asset = await Asset.findById(id).populate(
    "assetCategory location department",
  );
  if (!asset) throw new ApiError(404, "Asset not found");
  return asset;
};

const createAssetService = async (data) => {
  const { Asset } = useModels();
  return await Asset.create(data);
};

const updateAssetService = async (id, data) => {
  const { Asset } = useModels();
  const asset = await Asset.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!asset) throw new ApiError(404, "Asset not found");
  return asset;
};

const toggleAssetStatusService = async (id) => {
  const { Asset } = useModels();
  const asset = await Asset.findById(id);
  if (!asset) throw new ApiError(404, "Asset not found");

  asset.isActive = !asset.isActive;
  await asset.save();

  return {
    updatedRecord: asset,
    successMessage: `Asset status toggled to ${asset.isActive ? "Active" : "Inactive"}`,
  };
};

export {
  getAssetsService,
  getAssetByIdService,
  createAssetService,
  updateAssetService,
  toggleAssetStatusService,
};
