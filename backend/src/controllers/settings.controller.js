import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getSettingsService,
  getSettingsByIdService,
  updateSettingsService,
} from "../services/settings.service.js";

const getAllSettings = asyncHandler(async (req, res) => {
  const result = await getSettingsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Settings fetched successfully"));
});

const getSettingsById = asyncHandler(async (req, res) => {
  const settings = await getSettingsByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, settings, "Settings fetched successfully"));
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await updateSettingsService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, settings, "Settings updated successfully"));
});

export { getAllSettings, getSettingsById, updateSettings };
