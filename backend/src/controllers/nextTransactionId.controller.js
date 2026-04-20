import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getSequencesService,
  getSequenceByIdService,
  updateSequenceService,
} from "../services/nextTransactionId.service.js";

const getAllSequences = asyncHandler(async (req, res) => {
  const result = await getSequencesService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Sequences fetched successfully"));
});

const getSequenceById = asyncHandler(async (req, res) => {
  const sequence = await getSequenceByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, sequence, "Sequence fetched successfully"));
});

const updateSequence = asyncHandler(async (req, res) => {
  const sequence = await updateSequenceService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, sequence, "Sequence updated successfully"));
});

export { getAllSequences, getSequenceById, updateSequence };
