import { WorkflowRole } from "../models/workflowRole.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toggleStatus } from "../utils/toggleStatus.js";

const getWorkflowRole = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query;

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }

  const getWorkflowRoleData = await WorkflowRole.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    }
  );

  const paginateData = { ...getWorkflowRoleData };
  delete paginateData.docs;

  // Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getWorkflowRoleData.docs,
        "Workflow Role Data fetched Successfully!!",
        paginateData
      )
    );
});

// GET Workflow Role by ID
const getWorkflowRoleById = asyncHandler(async (req, res) => {
  const { wfRoleCode } = req.params;

  const existingWfRoleCode = await WorkflowRole.findOne({ wfRoleCode });
  if (!existingWfRoleCode) {
    throw new ApiError(404, "Invalid Workflow Role!!");
  }

  // Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        existingWfRoleCode,
        "Single Workflow Role Fetched Successfully!!"
      )
    );
});

// ADD Workflow Role
const addWorkflowRole = asyncHandler(async (req, res) => {
  const { wfRoleCode, description, wfRoleType } = req.body;

  // Check Code
  if (!wfRoleCode) {
    throw new ApiError(400, "Workflow Code is Mandatory!!");
  }

  const existingWfRoleCode = await WorkflowRole.findOne({ wfRoleCode });
  if (existingWfRoleCode) {
    throw new ApiError(400, "Workflow Role Already Exists!!");
  }

  // Check Required fields
  if (!description || !wfRoleType) {
    throw new ApiError(400, "Description / Workflow Role is Mandatory!!");
  }

  const modelwfType = ["submit", "approve", "reject", "delegate"];
  // Check req Type from Model Types
  const checkwfType = wfRoleType.every((role) => modelwfType.includes(role));

  if (!checkwfType) {
    throw new ApiError(400, "Work Role Type must be from the provided Types!!");
  }

  const createWfRole = await WorkflowRole.create({
    wfRoleCode,
    description,
    wfRoleType,
  });

  if (!createWfRole) {
    throw new ApiError(500, "An Error Occured while creating Workflow Role!!");
  }

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(200, createWfRole, "Workflow Role Successfully Created!!")
    );
});

const updateWorkflowRole = asyncHandler(async (req, res) => {
  const { wfRoleCode } = req.params;
  const { description, wfRoleType } = req.body;

  const existingWfRole = await WorkflowRole.findOne({ wfRoleCode });
  if (!existingWfRole) {
    throw new ApiError(404, "Workflow Role not Found!!");
  }
  // Check Required fields
  if (!description || !wfRoleType) {
    throw new ApiError(400, "Description / Workflow Role is Mandatory!!");
  }

  const modelwfType = ["submit", "approve", "reject", "delegate"];
  // Check req Type from Model Types
  const checkwfType = wfRoleType.every((role) => modelwfType.includes(role));
  if (!checkwfType) {
    throw new ApiError(
      400,
      "Workflow Role Type must be from the provided Types!!"
    );
  }

  // Object for Updating Data
  const updateFields = {};
  if (description !== existingWfRole.description) {
    updateFields.description = description;
  }
  const areWfRolesDifferent =
    wfRoleType.length !== existingWfRole.wfRoleType.length ||
    !wfRoleType.every(
      (role) => role !== existingWfRole.wfRoleType.includes(role)
    );
  if (areWfRolesDifferent) {
    updateFields.wfRoleType = wfRoleType;
  }

  // Check changes
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No changes detected!");
  }

  const updatedwfRole = await WorkflowRole.findByIdAndUpdate(
    existingWfRole._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  //Return RES
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedwfRole,
        "Workflow Role Successfully updated!!"
      )
    );
});

const toggleWorkflowRoleStatus = asyncHandler(async (req, res) => {
  const { wfRoleCode } = req.params;

  const existingWfRole = await WorkflowRole.findOne({ wfRoleCode });
  if (!existingWfRole) {
    throw new ApiError(400, "Invalid Workflow Role!!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    WorkflowRole,
    existingWfRole._id
  );

  //Retrun RES
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
