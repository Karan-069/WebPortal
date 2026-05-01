import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getFeaturesService,
  addFeatureService,
  getFeatureByIdService,
  updateFeatureService,
  toggleFeatureStatusService,
  getFeatureMapService,
  seedDefaultFeaturesService,
} from "../services/feature.service.js";

const getFeatures = asyncHandler(async (req, res) => {
  const result = await getFeaturesService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Features fetched successfully"));
});

const getFeatureMap = asyncHandler(async (req, res) => {
  const result = await getFeatureMapService();
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Feature map fetched successfully"));
});

const seedFeatures = asyncHandler(async (req, res) => {
  const result = await seedDefaultFeaturesService();
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Features seeded successfully"));
});

const addFeature = asyncHandler(async (req, res) => {
  const feature = await addFeatureService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, feature, "Feature created successfully"));
});

const getFeatureById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const feature = await getFeatureByIdService(id);
  return res
    .status(200)
    .json(new ApiResponse(200, feature, "Feature fetched successfully"));
});

const updateFeature = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // If id is not present in params (old route), check body for name
  const targetId = id || req.body.name;
  const updatedFeature = await updateFeatureService(targetId, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedFeature, "Feature updated successfully"));
});

const toggleFeatureStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { updatedRecord, successMessage } =
    await toggleFeatureStatusService(id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getFeatures,
  addFeature,
  getFeatureById,
  updateFeature,
  toggleFeatureStatus,
  getFeatureMap,
  seedFeatures,
};
