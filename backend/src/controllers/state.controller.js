import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getStatesService,
  getStateByIdService,
  addStateService,
  updateStateService,
  toggleStateStatusService,
} from "../services/state.service.js";

const getStates = asyncHandler(async (req, res) => {
  const result = await getStatesService(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "States Data Successfully Fectched!!"));
});

const getStateById = asyncHandler(async (req, res) => {
  const { stateCode } = req.params;
  const exisintgCode = await getStateByIdService(stateCode);

  return res
    .status(200)
    .json(
      new ApiResponse(200, exisintgCode, "State Data successfully Fetched!!"),
    );
});

const addState = asyncHandler(async (req, res) => {
  const newStateCode = await addStateService(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, newStateCode, "State Successfully Added!!"));
});

const updateState = asyncHandler(async (req, res) => {
  const { stateCode } = req.params;
  const updatedState = await updateStateService(stateCode, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedState, "State Updated Successfully!!"));
});

const toggleStateStatus = asyncHandler(async (req, res) => {
  const { stateCode } = req.params;
  const { updatedRecord, successMessage } =
    await toggleStateStatusService(stateCode);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export { getStates, getStateById, addState, updateState, toggleStateStatus };
