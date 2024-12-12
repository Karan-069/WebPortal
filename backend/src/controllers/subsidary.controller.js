import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subsidary } from "../models/subsidary.model.js";
import mongoose from "mongoose";
import { City } from "../models/city.model.js";
import { State } from "../models/state.model.js";
import { toggleStatus } from "../utils/toggleStatus.js";

// GET all Subsidaries
const getSubsidaries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query;

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }

  const getSubsidariesData = await Subsidary.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    }
  );

  if (!getSubsidariesData) {
    throw new ApiError(500, "An Error Occured while fetching Data!!");
  }

  const paginateData = { ...getSubsidariesData };
  delete paginateData.docs;

  //Populate City and State
  for (let subsidary of getSubsidariesData.docs) {
    await subsidary.PopulateCityAndState();
  }

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getSubsidariesData.docs,
        "Subsidaies Data Fetched Sucessfully!!",
        paginateData
      )
    );
});

//GET A Subsidary
const getSubsidaryById = asyncHandler(async (req, res) => {
  const { subCode } = req.params;

  if (!subCode) {
    throw new ApiError(400, "Subsidary Code is requried in request!");
  }

  const getSubsidary = await Subsidary.findOne({ subCode });
  if (!getSubsidary) {
    throw new ApiError(400, "Invalid Subsidary!!");
  }

  //Populate City and State
  await getSubsidary.PopulateCityAndState();

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(200, getSubsidary, "A Subsidary Fetched Successfully!!")
    );
});

//ADD Subsidary
const addSubsidary = asyncHandler(async (req, res) => {
  const { subCode, description, address1, address2, city, state } = req.body;

  if (!subCode || !description || !city || !state) {
    throw new ApiError(
      400,
      "Subsidary Code, Descrpition, City and State are Mandatory!!"
    );
  }
  //Check Duplicate SubCode
  const isSubCodeExist = await Subsidary.findOne({ subCode });
  if (isSubCodeExist) {
    throw new ApiError(400, "Subsidary Code Already Exists!!");
  }
  // Check Valid City and State
  if (!mongoose.Types.ObjectId.isValid(city)) {
    throw new ApiError(400, "InValid City Object ID!!");
  }
  if (!mongoose.Types.ObjectId.isValid(state)) {
    throw new ApiError(400, "InValid State Object ID!!");
  }

  // Check City and State are Present in DB
  const isCityValid = await City.findById(city);
  if (!isCityValid) {
    throw new ApiError(404, "InValid City!!");
  }
  const isStateValid = await State.findById(state);
  if (!isStateValid) {
    throw new ApiError(404, "InValid State!!");
  }

  const newSubsidary = await Subsidary.create({
    subCode,
    description,
    address1,
    address2,
    city,
    state,
  });

  if (!newSubsidary) {
    throw new ApiError(500, "An Error Occured while creating Document!!");
  }

  //Populate City and State
  await newSubsidary.PopulateCityAndState();

  //Return RES
  return res
    .status(201)
    .json(
      new ApiResponse(201, newSubsidary, "Subsidary Successfully Created!!")
    );
});

// Update Subsidary
const updateSubsidary = asyncHandler(async (req, res) => {
  const { subCode } = req.params;
  const { description, address1, address2, city, state } = req.body;

  if (!description || !city || !state) {
    throw new ApiError(400, "Descrpition, City and State are Mandatory!!");
  }
  //Check Duplicate SubCode
  const isSubCodeValid = await Subsidary.findOne({ subCode });
  if (!isSubCodeValid) {
    throw new ApiError(404, "Invalid Subsidary Code!!");
  }

  // Check Valid City and State
  if (!mongoose.Types.ObjectId.isValid(city)) {
    throw new ApiError(400, "InValid City Object ID!!");
  }
  if (!mongoose.Types.ObjectId.isValid(state)) {
    throw new ApiError(400, "InValid State Object ID!!");
  }

  // Check City and State are Present in DB
  const isCityValid = await City.findById(city);
  if (!isCityValid) {
    throw new ApiError(404, "InValid City!!");
  }
  const isStateValid = await State.findById(state);
  if (!isStateValid) {
    throw new ApiError(404, "InValid State!!");
  }

  const updateFields = {};
  if (description && description !== isSubCodeValid.description) {
    updateFields.description = description;
  }
  if (address1 && address1 !== isSubCodeValid.address1) {
    updateFields.address1 = address1;
  }
  if (address2 && address2 !== isSubCodeValid.address2) {
    updateFields.address2 = address2;
  }
  if (city && !new mongoose.Types.ObjectId(city).equals(isSubCodeValid.city)) {
    updateFields.city = city;
  }
  if (
    state &&
    !new mongoose.Types.ObjectId(state).equals(isSubCodeValid.state)
  ) {
    updateFields.state = state;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No changes detected!");
  }

  const updateSubsidaryData = await Subsidary.findByIdAndUpdate(
    isSubCodeValid._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updateSubsidaryData) {
    throw new ApiError(500, "An error Occured while updating Document!");
  }

  await updateSubsidaryData.PopulateCityAndState();

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateSubsidaryData,
        "Subsidary Updated Successfully!!"
      )
    );
});

//Deactive Subsidary
const toggleSubsidaryStatus = asyncHandler(async (req, res) => {
  const { subCode } = req.params;

  const isSubCodeValid = await Subsidary.findOne({ subCode });
  if (!isSubCodeValid) {
    throw new ApiError(400, "Invalid Subsidary Code!!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    Subsidary,
    isSubCodeValid._id
  );

  //Retunr RES
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
