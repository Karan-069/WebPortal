import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getCitiesService,
  getCityByIdService,
  addCityService,
  updateCityService,
  toggleCityStatusService,
} from "../services/city.service.js";

const getCities = asyncHandler(async (req, res) => {
  const result = await getCitiesService(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Cites Data Successfully Fetched!!"));
});

const getCityById = asyncHandler(async (req, res) => {
  const { cityCode } = req.params;
  const existingCity = await getCityByIdService(cityCode);

  return res
    .status(200)
    .json(
      new ApiResponse(200, existingCity, "A City Successfully Fecteched!!"),
    );
});

const addCity = asyncHandler(async (req, res) => {
  const newCity = await addCityService(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, newCity, "City Created Successfully!!"));
});

const updateCity = asyncHandler(async (req, res) => {
  const { cityCode } = req.params;
  const updatedCity = await updateCityService(cityCode, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCity, "City Updated Successfully!!"));
});

const toggleCityStatus = asyncHandler(async (req, res) => {
  const { cityCode } = req.params;
  const { updatedRecord, successMessage } =
    await toggleCityStatusService(cityCode);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export { getCities, getCityById, addCity, updateCity, toggleCityStatus };
