import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getVendorsService,
  getVendorByIdService,
  createVendorService,
  updateVendorService,
  toggleVendorStatusService,
  getMyVendorProfileService,
  submitVendorProfileService,
} from "../services/vendor.service.js";
import { ApiError } from "../utils/ApiError.js";

const getVendors = asyncHandler(async (req, res) => {
  const result = await getVendorsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Vendors fetched successfully"));
});

const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await getVendorByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor fetched successfully"));
});

const createVendor = asyncHandler(async (req, res) => {
  const vendor = await createVendorService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, vendor, "Vendor created successfully"));
});

const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await updateVendorService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor updated successfully"));
});

const toggleVendorStatus = asyncHandler(async (req, res) => {
  const result = await toggleVendorStatusService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result.updatedRecord, result.successMessage));
});

const submitVendorProfile = asyncHandler(async (req, res) => {
  const result = await submitVendorProfileService(req.user._id, req.body);

  if (result.workflowWarning) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { vendor: result.vendor, workflowWarning: result.workflowWarning },
          "Profile saved, but workflow routing encountered an issue: " +
            result.workflowWarning,
        ),
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { vendor: result.vendor, workflowResult: result.workflowResult },
        "Profile submitted and routed for workflow approval successfully.",
      ),
    );
});

const getMyVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await getMyVendorProfileService(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor profile fetched successfully."));
});

export {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  toggleVendorStatus,
  submitVendorProfile,
  getMyVendorProfile,
};
