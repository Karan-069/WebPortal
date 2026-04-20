import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getLOBsService,
  getLOBByIdService,
  addLOBService,
  updateLOBService,
  toggleLOBStatusService,
} from "../services/lineOfBusiness.service.js";

const getLOBs = asyncHandler(async (req, res) => {
  const result = await getLOBsService(req.query);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Line of Business Data Successfully Fetched!!",
      ),
    );
});

const getLOBById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existingLOB = await getLOBByIdService(id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingLOB,
        "Line of Business Successfully Fetched!!",
      ),
    );
});

const addLOB = asyncHandler(async (req, res) => {
  const newLOB = await addLOBService(req.body);
  return res
    .status(201)
    .json(
      new ApiResponse(201, newLOB, "Line of Business Created Successfully!!"),
    );
});

const updateLOB = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedLOB = await updateLOBService(id, req.body);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedLOB,
        "Line of Business Updated Successfully!!",
      ),
    );
});

const toggleLOBStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { updatedRecord, successMessage } = await toggleLOBStatusService(id);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export { getLOBs, getLOBById, addLOB, updateLOB, toggleLOBStatus };
