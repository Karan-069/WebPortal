import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getCrtermsService,
  getCrtermByIdService,
  addCrtermService,
  updateCrtermService,
  toggleCrtermStatusService,
} from "../services/crterm.service.js";

const getCrterms = asyncHandler(async (req, res) => {
  const result = await getCrtermsService(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "All Credit Terms Fetched Successfully!!"),
    );
});

const getCrtermById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const checkTerm = await getCrtermByIdService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, checkTerm, "A Term Fetched Successfully!!"));
});

const addCrterm = asyncHandler(async (req, res) => {
  const newCrterm = await addCrtermService(req.body);

  return res
    .status(201)
    .json(
      new ApiResponse(201, newCrterm, "Credit Term Successfully Created!!"),
    );
});

const updateCrterm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedCrterm = await updateCrtermService(id, req.body);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCrterm, "Credit Term Updated Successfully!!"),
    );
});

const toggleCrtermStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { updatedRecord, successMessage } = await toggleCrtermStatusService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getCrterms,
  getCrtermById,
  addCrterm,
  updateCrterm,
  toggleCrtermStatus,
};
