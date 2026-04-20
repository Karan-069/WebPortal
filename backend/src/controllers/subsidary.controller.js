import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getSubsidariesService,
  getSubsidaryByIdService,
  addSubsidaryService,
  updateSubsidaryService,
  toggleSubsidaryStatusService,
} from "../services/subsidary.service.js";

const getSubsidaries = asyncHandler(async (req, res) => {
  const result = await getSubsidariesService(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Subsidaies Data Fetched Sucessfully!!"),
    );
});

const getSubsidaryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const getSubsidary = await getSubsidaryByIdService(id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, getSubsidary, "A Subsidary Fetched Successfully!!"),
    );
});

const addSubsidary = asyncHandler(async (req, res) => {
  const newSubsidary = await addSubsidaryService(req.body);

  return res
    .status(201)
    .json(
      new ApiResponse(201, newSubsidary, "Subsidary Successfully Created!!"),
    );
});

const updateSubsidary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateSubsidaryData = await updateSubsidaryService(id, req.body);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateSubsidaryData,
        "Subsidary Updated Successfully!!",
      ),
    );
});

const toggleSubsidaryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { updatedRecord, successMessage } =
    await toggleSubsidaryStatusService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getSubsidaries,
  getSubsidaryById,
  addSubsidary,
  updateSubsidary,
  toggleSubsidaryStatus,
};
