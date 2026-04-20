import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getDepartmentsService,
  addDepartmentService,
  getDepartmentByIdService,
  updateDepartmentService,
  toggleDepartmentStatusService,
} from "../services/department.service.js";

const getDepartments = asyncHandler(async (req, res) => {
  const result = await getDepartmentsService(req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Department Data Successfully Fecteched!!"),
    );
});

const addDepartment = asyncHandler(async (req, res) => {
  const department = await addDepartmentService(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, department, "Department Successfully Created"));
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deptData = await getDepartmentByIdService(id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, deptData, "Department Data Successfully Feteched!!"),
    );
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedDepartment = await updateDepartmentService(id, req.body);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedDepartment,
        "Department updated successfully",
      ),
    );
});

const toggleDepartmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { updatedRecord, successMessage } =
    await toggleDepartmentStatusService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecord, successMessage));
});

export {
  getDepartments,
  addDepartment,
  getDepartmentById,
  updateDepartment,
  toggleDepartmentStatus,
};
