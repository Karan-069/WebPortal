import { asyncHandler } from "../utils/asyncHandler.js";
import { State } from "../models/state.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { toggleStatus } from "../utils/toggleStatus.js";

//GET States
const getStates = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query;

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }

  const getSateData = await State.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    }
  );

  if (!getSateData) {
    throw new ApiError(500, "Error while Fetching Data!!");
  }
  const paginateData = { ...getSateData };
  delete paginateData.docs;

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getSateData.docs,
        "States Data Successfully Fectched!!",
        paginateData
      )
    );
});

// GET State by ID
const getStateById = asyncHandler(async (req, res) => {
  const { stateCode } = req.params;

  const exisintgCode = await State.findOne({ stateCode });
  if (!exisintgCode) {
    throw new ApiError(400, "Invalid State Code!!");
  }

  // Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(200, exisintgCode, "State Data successfully Fetched!!")
    );
});

//ADD State
const addState = asyncHandler(async (req, res) => {
  const { stateCode, description, gstCode, region } = req.body;

  if (!stateCode || !description || !gstCode) {
    throw new ApiError(400, "Sate Code, Description, Gst Code are Mandatory!!");
  }
  //Check Duplicate
  const checkduplicate = await State.findOne({
    $or: [{ stateCode }, { description }, { gstCode }],
  });
  if (checkduplicate) {
    throw new ApiError(400, "Sate Code/ Description / gstCode Alrady exists!!");
  }

  const newStateCode = await State.create({
    stateCode,
    description,
    gstCode,
    region,
  });

  if (!newStateCode) {
    throw new ApiError(500, "Error while creating State!!");
  }

  //Return RES
  return res
    .status(201)
    .json(new ApiResponse(201, newStateCode, "State Successfully Added!!"));
});

// UPDATE State
const updateState = asyncHandler(async (req, res) => {
  const { stateCode } = req.params;
  const { description, gstCode, region } = req.body;

  const exisitngState = await State.findOne({ stateCode });
  if (!exisitngState) {
    throw new ApiError(400, "Invalid State Code!!");
  }
  if (!description || !gstCode) {
    throw new ApiError(400, "Description, Gst Code are Mandatory!!");
  }

  const updateFields = {};
  if (description !== exisitngState.description) {
    updateFields.description = description;
  }
  if (gstCode !== exisitngState.gstCode) {
    updateFields.gstCode = gstCode;
  }
  if (region !== exisitngState.region) {
    updateFields.region = region;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No Changes Dedcted");
  }

  const updatedState = await State.findByIdAndUpdate(
    exisitngState._id,
    {
      $set: updateFields,
    },
    { new: true, runValidators: true }
  );

  //Return RES
  return res
    .status(200)
    .json(new ApiResponse(200, updatedState, "State Updated Successfully!!"));
});

const toggleStateStatus = asyncHandler(async (req, res) => {
  const { stateCode } = req.params;

  const exisitngState = await State.findOne({ stateCode });
  if (!exisitngState) {
    throw new ApiError(400, "Invalid State Code!!");
  }

  //Use Util to toggle
  const { updatedRecord, successMessage } = await toggleStatus(
    State,
    exisitngState._id
  );

  //Return RES
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export { getStates, getStateById, addState, updateState, toggleStateStatus };
