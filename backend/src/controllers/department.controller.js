import { Department } from "../models/department.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { softDeleteRecord } from "../utils/softDeleteRecord.js";

// GET all Departments
const getDepartments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query; // Get queries with defaults for page and limit

  // Parse and validate pagination params
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1; // Use 1 for ascending, -1 for descending
  }

  // Fetch the paginated departments with sorting
  const departments = await Department.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    }
  );

  const paginateData = { ...departments };
  delete paginateData.docs;

  // Return the paginated response in a consistent format
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        departments.docs,
        "Departments fetched successfully",
        paginateData
      )
    );
});

// ADD new Department
const addDepartment = asyncHandler(async (req, res) => {
  const { departmentHead, deptCode, description, location } = req.body;
  // Validate that department code is provided
  if (!deptCode) {
    throw new ApiError(400, "Department Code is Mandatory!!");
  }

  // Check if the department code already exists in the database
  const checkDeptCode = await Department.findOne({ deptCode });

  if (checkDeptCode) {
    throw new ApiError(401, "Department Code already exists!!");
  }

  // Create the department object
  const departmentObject = {
    departmentHead,
    deptCode,
    description,
    location,
  };

  // Create the department in the database
  const department = await Department.create(departmentObject);

  // Send a success response with the newly created department
  return res
    .status(201)
    .json(new ApiResponse(201, department, "Department Successfully Created"));
});

// GET Department by ID

const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deptData = await Department.findById(id);

  if (!deptData) {
    throw new ApiError(404, "Department not Found!!");
  }

  //Return RES
  return res
    .status(200)
    .json(
      new ApiResponse(200, deptData, "Department Data Successfully Feteched!!")
    );
});

// Update Department logic
const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get department ID from URL params
  const { departmentHead, description, location } = req.body; // Fields that may be updated

  // Fetch the existing department data from the database
  const existingDepartment = await Department.findById(id);
  if (!existingDepartment) {
    throw new ApiError(404, "Department not found!");
  }

  // Initialize an empty object to store changed fields
  const updatedFields = {};

  // Check each field for changes and add to updatedFields if changed
  if (departmentHead && departmentHead !== existingDepartment.departmentHead) {
    updatedFields.departmentHead = departmentHead;
  }
  if (description && description !== existingDepartment.description) {
    updatedFields.description = description;
  }
  if (location && location !== existingDepartment.location) {
    updatedFields.location = location;
  }

  // If no fields have changed, return a 400 response
  if (Object.keys(updatedFields).length === 0) {
    throw new ApiError(400, "No changes detected!");
  }

  // Apply the updates using the $set operator
  const updatedDepartment = await Department.findByIdAndUpdate(
    id,
    { $set: updatedFields },
    { new: true } // Return the updated document
  );

  // Respond with success message and updated department data
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedDepartment, "Department updated successfully")
    );
});

const deactivateDepartment = asyncHandler(async (req, res) => {
  const { deptId } = req.params;

  // Fetch and check if the department exists
  const existingDepartment = await Department.findById(deptId);
  if (!existingDepartment) {
    throw new ApiError(400, "Department Not Found!!");
  }

  // Deactivate the department
  const deactivateDept = await softDeleteRecord(Department, deptId);
  if (!deactivateDept) {
    throw new ApiError(500, "Error deactivating the department.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deactivateDept,
        "Department Deactivated Successfully!!"
      )
    );
});

export {
  getDepartments,
  addDepartment,
  getDepartmentById,
  updateDepartment,
  deactivateDepartment,
};
