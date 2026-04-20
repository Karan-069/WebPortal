import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getLocationsService,
  getLocationByIdService,
  addLocationService,
  updateLocationService,
  toggleLocationStatusService,
} from "../services/location.service.js";

const getLocations = asyncHandler(async (req, res) => {
  const result = await getLocationsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Locations fetched successfully"));
});

const getLocationById = asyncHandler(async (req, res) => {
  const result = await getLocationByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Location fetched successfully"));
});

const addLocation = asyncHandler(async (req, res) => {
  const result = await addLocationService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Location created successfully"));
});

const updateLocation = asyncHandler(async (req, res) => {
  const result = await updateLocationService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Location updated successfully"));
});

const toggleLocationStatus = asyncHandler(async (req, res) => {
  const result = await toggleLocationStatusService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Location status toggled successfully"));
});

export {
  getLocations,
  getLocationById,
  addLocation,
  updateLocation,
  toggleLocationStatus,
};
