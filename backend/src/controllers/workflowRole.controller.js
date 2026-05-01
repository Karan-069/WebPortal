import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getWorkflowRoleService,
  getWorkflowRoleByIdService,
  addWorkflowRoleService,
  updateWorkflowRoleService,
  toggleWorkflowRoleStatusService,
} from "../services/workflowRole.service.js";

const getWorkflowRole = asyncHandler(async (req, res) => {
  const result = await getWorkflowRoleService(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Workflow Role Data fetched Successfully!!"),
    );
});

const getWorkflowRoleById = asyncHandler(async (req, res) => {
  const { wfRoleCode } = req.params;
  const existingWfRoleCode = await getWorkflowRoleByIdService(wfRoleCode);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingWfRoleCode,
        "Single Workflow Role Fetched Successfully!!",
      ),
    );
});

const addWorkflowRole = asyncHandler(async (req, res) => {
  const createWfRole = await addWorkflowRoleService(req.body);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createWfRole,
        "Workflow Role Successfully Created!!",
      ),
    );
});

const updateWorkflowRole = asyncHandler(async (req, res) => {
  const { wfRoleCode } = req.params;
  const updatedwfRole = await updateWorkflowRoleService(wfRoleCode, req.body);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedwfRole,
        "Workflow Role Successfully updated!!",
      ),
    );
});

const toggleWorkflowRoleStatus = asyncHandler(async (req, res) => {
  const { wfRoleCode } = req.params;
  const { updatedRecord, successMessage } =
    await toggleWorkflowRoleStatusService(wfRoleCode);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getWorkflowRole,
  getWorkflowRoleById,
  addWorkflowRole,
  updateWorkflowRole,
  toggleWorkflowRoleStatus,
};
