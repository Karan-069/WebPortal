import { Department } from "../models/department.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginate } from "../utils/paginate.js";


//GET all Departments
const getDepartments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy, sortOrder } = req.query; // Get queries with defaults for page and limit

  // Initialize the sort object
  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;  // Use 1 for ascending, -1 for descending
  }

  // Fetch the paginated departments with sorting
  const departments = await paginate(Department, page, limit, {}, sort);

  // Return the paginated response in a consistent format
  return res.status(200).json(
    new ApiResponse(200, 
                    departments.data,  // The actual department data
                    "Departments fetched successfully",
                    departments.pagination // The pagination metadata
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
      .json(new ApiResponse(201, 
          department, 
          "Department Successfully Created"));
  });

  // GET Department by ID

const getDepartmentById = asyncHandler(async (req, res) =>{
    const { id } = req.parms;

    const deptData = await Department.findById(id)

    if(!deptData){
      throw new ApiError(404, "Department not Found!!")
    };

    //Return RES
    return res.status(200).json(
      200,
      deptData,
      "Department Data Successfully Feteched!!"
    )

})
  

  export{
    getDepartments,
    addDepartment,
    getDepartmentById
  }