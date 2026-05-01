import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";
import { enrichWithWorkflowState } from "../utils/workflowHelper.js";

const getDepartmentsService = async (query) => {
  const { Department } = useModels();
  const {
    page: requestedPage = 1,
    limit: requestedLimit = 50,
    search = "",
    sortBy,
    sortOrder,
  } = query;
  const pageNum = parseInt(requestedPage) > 0 ? parseInt(requestedPage) : 1;
  const limitNum = parseInt(requestedLimit) > 0 ? parseInt(requestedLimit) : 50;

  const filter = {};
  if (search) {
    filter.$or = [
      { deptCode: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const departmentData = await Department.paginate(filter, {
    page: pageNum,
    limit: limitNum,
    sort: sort,
    populate: [
      { path: "createdBy", select: "fullName" },
      { path: "updatedBy", select: "fullName" },
      { path: "departmentHead", select: "fullName email" },
      { path: "location", select: "description locationCode" },
    ],
  });

  const { docs, totalDocs, totalPages, page, limit } = departmentData;
  const enrichedDocs = await enrichWithWorkflowState(docs, "Department");
  return { docs: enrichedDocs, totalDocs, totalPages, page, limit };
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
  const deptData = await Department.findOne(query)
    .populate("createdBy updatedBy", "fullName")
    .populate("departmentHead", "fullName email")
    .populate("location", "description locationCode");
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
  )
    .populate("createdBy updatedBy", "fullName")
    .populate("departmentHead", "fullName email")
    .populate("location", "description locationCode");

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
