import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getAssetsService,
  getAssetByIdService,
  createAssetService,
  updateAssetService,
  toggleAssetStatusService,
} from "../services/asset.service.js";

const getAllAssets = asyncHandler(async (req, res) => {
  const result = await getAssetsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Assets fetched successfully"));
});

const getAssetById = asyncHandler(async (req, res) => {
  const asset = await getAssetByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, asset, "Asset fetched successfully"));
});

const createAsset = asyncHandler(async (req, res) => {
  const asset = await createAssetService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, asset, "Asset created successfully"));
});

const updateAsset = asyncHandler(async (req, res) => {
  const asset = await updateAssetService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, asset, "Asset updated successfully"));
});

const toggleAssetStatus = asyncHandler(async (req, res) => {
  const result = await toggleAssetStatusService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result.updatedRecord, result.successMessage));
});

export {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  toggleAssetStatus,
};
