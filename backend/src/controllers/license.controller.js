import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getLicensesService,
  getLicenseByIdService,
  createLicenseService,
  updateLicenseService,
  deleteLicenseService,
} from "../services/license.service.js";

const getAllLicenses = asyncHandler(async (req, res) => {
  const result = await getLicensesService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Licenses fetched successfully"));
});

const getLicenseById = asyncHandler(async (req, res) => {
  const license = await getLicenseByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, license, "License fetched successfully"));
});

const createLicense = asyncHandler(async (req, res) => {
  const license = await createLicenseService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, license, "License created successfully"));
});

const updateLicense = asyncHandler(async (req, res) => {
  const license = await updateLicenseService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, license, "License updated successfully"));
});

const deleteLicense = asyncHandler(async (req, res) => {
  await deleteLicenseService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "License deleted successfully"));
});

export {
  getAllLicenses,
  getLicenseById,
  createLicense,
  updateLicense,
  deleteLicense,
};
