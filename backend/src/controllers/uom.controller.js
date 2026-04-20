import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getUomsService,
  getUomByIdService,
  addUomService,
  updateUomService,
  toggleUomStatusService,
} from "../services/uom.service.js";

const getUoms = asyncHandler(async (req, res) => {
  const result = await getUomsService(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "All Uoms fetched Successfully!!"));
});

const getUomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isUomValid = await getUomByIdService(id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, isUomValid, "A UOM Data Fetched Successfully!!"),
    );
});

const addUom = asyncHandler(async (req, res) => {
  const newUom = await addUomService(req.body);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newUom,
        "Unit of Messurement Successfully Created!!",
      ),
    );
});

const updateUom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedUom = await updateUomService(id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUom, "Uom Successfully Updated!!"));
});

const toggleUomStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { updatedRecord, successMessage } = await toggleUomStatusService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export { getUoms, getUomById, addUom, updateUom, toggleUomStatus };
