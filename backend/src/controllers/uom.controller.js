import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Uom } from "../models/uom.model.js";
import { toggleStatus } from "../utils/toggleStatus.js";

//GET all UOM
const getUoms = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query;

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }
  const getAllUoms = await Uom.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    }
  );

  if (!getAllUoms) {
    throw new ApiError(500, "An Error Occured while Fetching UOMs!!");
  }

  const paginateData = { ...getAllUoms };
  delete paginateData.docs;

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getAllUoms.docs,
        "All Uoms fetched Successfully!!",
        paginateData
      )
    );
});

//GET A Uom
const getUomById = asyncHandler(async (req, res) => {
  const { uomCode } = req.params;

  if (!uomCode) {
    throw new ApiError(400, "UOM Code Missing!!");
  }

  const isUomValid = await Uom.findOne({ uomCode });
  if (!isUomValid) {
    throw new ApiError(400, "Invalid Unit of Messurement!!");
  }

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(200, isUomValid, "A UOM Data Fetched Successfully!!")
    );
});

//ADD Uom
const addUom = asyncHandler(async (req, res) => {
  const { uomCode, description } = req.body;

  if (!uomCode) {
    throw new ApiError(400, "Uom Code is Mandatory!!");
  }

  const isUomExists = await Uom.findOne({ uomCode });
  if (isUomExists) {
    throw new ApiError(400, "Uom Code Already Exisits!!");
  }

  const newUom = await Uom.create({
    uomCode,
    description,
  });

  if (!newUom) {
    throw new ApiError(500, "An Error Occurred while Creating Uom!!");
  }

  //Return RES
  return res
    .status(201)
    .json(
      new ApiResponse(201, newUom, "Unit of Messurement Successfully Created!!")
    );
});

//Update Uom
const updateUom = asyncHandler(async (req, res) => {
  const { uomCode } = req.params;
  const { description } = req.body;

  if (!uomCode) {
    throw new ApiError(400, "Uom Code is Missing.");
  }

  const isUomValid = await Uom.findOne({ uomCode });
  if (!isUomValid) {
    throw new ApiError(404, "Invalid Unit of Messurement!!");
  }

  const fieldsToUpdate = {};
  if (description && description !== isUomValid.description) {
    fieldsToUpdate.description = description;
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new ApiError(400, "No Changes Dedcted");
  }

  const updatedUom = await Uom.findByIdAndUpdate(
    isUomValid._id,
    { $set: fieldsToUpdate },
    { new: true, runValidators: true }
  );

  if (!updatedUom) {
    throw new ApiError(500, "An Error Occured while Updaing UOM");
  }

  //Return RES
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUom, "Uom Successfully Updated!!"));
});

// Toggle Status
const toggleUomStatus = asyncHandler(async (req, res) => {
  const { uomCode } = req.params;

  if (!uomCode) {
    throw new ApiError(400, "Uom is Mandandatory!");
  }

  const isUomValid = await Uom.findOne({ uomCode });
  if (!isUomValid) {
    throw new ApiError(404, "Invalid Unit of Mesurement!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    Uom,
    isUomValid._id
  );

  //Return RES
  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export { getUoms, getUomById, addUom, updateUom, toggleUomStatus };
