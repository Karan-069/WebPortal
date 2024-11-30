import { Crterm } from "../models/crterm.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { toggleStatus } from "../utils/toggleStatus.js";

//GET all CrTerm
const getCrterms = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query;

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }

  const getTermsData = await Crterm.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    }
  );

  const paginateData = { ...getTermsData };
  delete paginateData.docs;

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getTermsData.docs,
        "All Credit Terms Fetched Successfully!!",
        paginateData
      )
    );
});

//GET Crterm By Id
const getCrtermById = asyncHandler(async (req, res) => {
  const { termCode } = req.params;

  const checkTerm = await Crterm.findOne({ termCode });
  if (!checkTerm) {
    throw new ApiError(400, "Invalid Credit Term!!");
  }

  //Return RES
  return res
    .status(200)
    .json(new ApiResponse(200, checkTerm, "A Term Fetched Successfully!!"));
});

//ADD Crterm
const addCrterm = asyncHandler(async (req, res) => {
  const { termCode, description, days } = req.body;

  if (!termCode || !description || !days) {
    throw new ApiError(400, "All Fields are Mandatory!!");
  }
  const checkTermCode = await Crterm.findOne({ termCode });
  if (checkTermCode) {
    throw new ApiError(400, "Credit Term Code Already Exists!!");
  }

  // Add Data in DB
  const newCrterm = await Crterm.create({
    termCode,
    description,
    days,
  });

  if (!newCrterm) {
    throw new ApiError(500, "An Error Occured while Creating Credit Term!!");
  }

  //Return RES
  return res
    .status(201)
    .json(
      new ApiResponse(201, newCrterm, "Credit Term Successfully Created!!")
    );
});

//Update Crterm
const updateCrterm = asyncHandler(async (req, res) => {
  const { termCode } = req.params;
  const { description, days } = req.body;

  const checkTermCode = await Crterm.findOne({ termCode });
  if (!checkTermCode) {
    throw new ApiError(400, "Invalid Credit Term !!");
  }

  if (!days) {
    throw new ApiError(400, "Days are Mandatory!!");
  }
  const updateCrterm = {};
  if (description && description !== checkTermCode.description) {
    updateCrterm.description = description;
  }
  if (days && days !== checkTermCode.days) {
    updateCrterm.days = days;
  }

  if (Object.keys(updateCrterm).length === 0) {
    throw new ApiError(400, "No Changes Deducted!!");
  }

  const updatedCrterm = await Crterm.findOneAndUpdate(
    checkTermCode._id,
    {
      $set: updateCrterm,
    },
    { new: true, runValidators: true }
  );

  if (!updateCrterm) {
    throw new ApiError(500, "An Error Occured while Updating Credit Term!!");
  }

  //Retun RES
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCrterm, "Credit Term Updated Successfully!!")
    );
});

//Toggle Crterm Status
const toggleCrtermStatus = asyncHandler(async (req, res) => {
  const { termCode } = req.params;

  const checkTermCode = await Crterm.findOne({ termCode });
  if (!checkTermCode) {
    throw new ApiError(400, "Invalid Credit Term !!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    Crterm,
    checkTermCode._id
  );

  //Return RES
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
