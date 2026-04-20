import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getCOAsService,
  getCOAByIdService,
  addCOAService,
  updateCOAService,
  toggleCOAStatusService,
} from "../services/chartOfAccounts.service.js";

const getCOAs = asyncHandler(async (req, res) => {
  const result = await getCOAsService(req.query);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Chart of Accounts Data Successfully Fetched!!",
      ),
    );
});

const getCOAById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existingCOA = await getCOAByIdService(id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingCOA,
        "Chart of Accounts Successfully Fetched!!",
      ),
    );
});

const addCOA = asyncHandler(async (req, res) => {
  const newCOA = await addCOAService(req.body);
  return res
    .status(201)
    .json(
      new ApiResponse(201, newCOA, "Chart of Accounts Created Successfully!!"),
    );
});

const updateCOA = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedCOA = await updateCOAService(id, req.body);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedCOA,
        "Chart of Accounts Updated Successfully!!",
      ),
    );
});

const toggleCOAStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { updatedRecord, successMessage } = await toggleCOAStatusService(id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export { getCOAs, getCOAById, addCOA, updateCOA, toggleCOAStatus };
