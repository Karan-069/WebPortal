import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getDepartmentsService = async (query) => {
  const { Department } = useModels();
  const {
    page: requestedPage = 1,
    limit: requestedLimit = 50,
    sortBy,
    sortOrder,
  } = query;
  const pageNum = parseInt(requestedPage) > 0 ? parseInt(requestedPage) : 1;
  const limitNum = parseInt(requestedLimit) > 0 ? parseInt(requestedLimit) : 50;

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const departmentData = await Department.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    },
  );

  const { docs, totalDocs, totalPages, page, limit } = departmentData;
  return { docs, totalDocs, totalPages, page, limit };
};

const addDepartmentService = async (body) => {
  const { Department } = useModels();
  const { departmentHead, deptCode, description, location } = body;

  if (!deptCode) {
    throw new ApiError(400, "Department Code is Mandatory!!");
  }

  const checkDeptCode = await Department.findOne({ deptCode });

  if (checkDeptCode) {
    throw new ApiError(401, "Department Code already exists!!");
  }

  const department = await Department.create({
    departmentHead,
    deptCode,
    description,
    location,
  });

  if (department) {
    await department.populate("createdBy updatedBy", "fullName");
  }

  return department;
};

const getDepartmentByIdService = async (id) => {
  const { Department } = useModels();
  const query = getLookupQuery(id, "deptCode");
  const deptData = await Department.findOne(query).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!deptData) {
    throw new ApiError(404, "Department not Found!!");
  }
  return deptData;
};

const updateDepartmentService = async (id, body) => {
  const { Department } = useModels();
  const { departmentHead, description, location } = body;

  const query = getLookupQuery(id, "deptCode");
  const existingDepartment = await Department.findOne(query);
  if (!existingDepartment) {
    throw new ApiError(404, "Department not found!");
  }

  const updatedDepartment = await Department.findByIdAndUpdate(
    existingDepartment._id,
    { $set: body },
    { new: true, runValidators: true },
  ).populate("createdBy updatedBy", "fullName");

  return updatedDepartment;
};

const toggleDepartmentStatusService = async (id) => {
  const { Department } = useModels();
  const query = getLookupQuery(id, "deptCode");
  const existingDepartment = await Department.findOne(query);
  if (!existingDepartment) {
    throw new ApiError(400, "Department Not Found!!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    Department,
    existingDepartment._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getDepartmentsService,
  addDepartmentService,
  getDepartmentByIdService,
  updateDepartmentService,
  toggleDepartmentStatusService,
};
