import { asyncHandler } from "../utils/asyncHandler.js";
import { City } from "../models/city.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { State } from "../models/state.model.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import mongoose from "mongoose";

//GET All Cites
const getCities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query;

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }

  const getCitiesData = await City.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    }
  );

  //Populate State
  for (let city of getCitiesData.docs) {
    await city.PopulateState();
  }

  const paginateData = { ...getCitiesData };
  delete paginateData.docs;

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getCitiesData.docs,
        "Cites Data Successfully Fetched!!",
        paginateData
      )
    );
});

//GET City
const getCityById = asyncHandler(async (req, res) => {
  const { cityCode } = req.params;

  const existingCity = await City.findOne({ cityCode });
  if (!cityCode) {
    throw new ApiError(400, "Invalid City Code!!");
  }

  //Populate State
  await existingCity.PopulateState();

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(200, existingCity, "A City Successfully Fecteched!!")
    );
});

// ADD City
const addCity = asyncHandler(async (req, res) => {
  const { cityCode, description, shortName, stateCode } = req.body;

  //Check Null
  if (!cityCode || !description || !stateCode) {
    throw new ApiError(
      400,
      "Sate Code, Description, City Code are Mandatory!!"
    );
  }

  //Check City
  const chkCity = await City.findOne({
    $or: [{ cityCode }, { description }],
  });
  if (chkCity) {
    throw new ApiError(400, "City Code / Description Already Exists!!");
  }

  //Check State
  if (!mongoose.Types.ObjectId.isValid(stateCode)) {
    throw new ApiError(400, "Invalid State Object ID!!");
  }
  //Check if State is present
  const chkState = await State.findById(stateCode);
  if (!chkState) {
    throw new ApiError(400, "Invalid State Code!!");
  }

  const newCity = await City.create({
    cityCode,
    description,
    shortName,
    stateCode,
  });

  if (!newCity) {
    throw new ApiError(500, "An Error Occured while adding City!!");
  }

  //Populating State
  await newCity.PopulateState();

  //Return RES
  return res
    .status(201)
    .json(new ApiResponse(201, newCity, "City Created Successfully!!"));
});

//Update City
const updateCity = asyncHandler(async (req, res) => {
  const { cityCode } = req.params;
  const { description, shortName, stateCode } = req.body;

  //Check Null
  if (!description || !stateCode) {
    throw new ApiError(400, "Sate Code, Description are Mandatory!!");
  }

  const existingCity = await City.findOne({ cityCode });
  if (!existingCity) {
    throw new ApiError(400, "Invalid City!!");
  }
  //Check valid State
  const chkState = await State.findById(stateCode);
  if (!chkState) {
    throw new ApiError(400, "Invalid State Code!!");
  }
  const updateFields = {};
  if (description && description !== existingCity.description) {
    updateFields.description = description;
  }
  if (shortName && shortName !== existingCity.shortName) {
    updateFields.shortName = shortName;
  }
  if (
    stateCode &&
    !new mongoose.Types.ObjectId(stateCode).equals(existingCity.stateCode)
  ) {
    updateFields.stateCode = stateCode;
  }

  const checkDuplicates = await City.findOne({
    description,
    _id: { $ne: existingCity._id },
  });
  if (checkDuplicates) {
    throw new ApiError(400, "Duplicate Description !!");
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No changes detected!");
  }

  const updatedCity = await City.findByIdAndUpdate(
    existingCity._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );
  if (!updatedCity) {
    throw new ApiError(500, "Error while Updating City Record!!");
  }

  await updatedCity.PopulateState();

  //Return RES
  return res
    .status(200)
    .json(new ApiResponse(200, updatedCity, "City Updated Successfully!!"));
});

//Toggle Status
const toggleCityStatus = asyncHandler(async (req, res) => {
  const { cityCode } = req.params;

  const chkCityCode = await City.findOne({ cityCode });
  if (!chkCityCode) {
    throw new ApiError(400, "Invalid City!!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    City,
    chkCityCode._id
  );

  //Populate State
  await updatedRecord.PopulateState();

  //Return RES
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export { getCities, getCityById, addCity, updateCity, toggleCityStatus };
