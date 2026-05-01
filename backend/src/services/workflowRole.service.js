import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getWorkflowRoleService = async (query) => {
  const { WorkflowRole } = useModels();
  const { page = 1, limit = 50, sortBy, sortOrder, search = "" } = query;

  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const filter = {};
  if (search) {
    filter.$or = [
      { wfRoleCode: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (query.wfRoleType) {
    filter.wfRoleType = {
      $in: Array.isArray(query.wfRoleType)
        ? query.wfRoleType
        : [query.wfRoleType],
    };
  }

  const getWorkflowRoleData = await WorkflowRole.paginate(filter, {
    page: pageNum,
    limit: limitNum,
    sort,
    populate: [
      { path: "createdBy", select: "fullName" },
      { path: "updatedBy", select: "fullName" },
    ],
  });

  const { docs, ...pagination } = getWorkflowRoleData;
  return { docs, ...pagination };
};

const getWorkflowRoleByIdService = async (id) => {
  const { WorkflowRole } = useModels();
  const query = getLookupQuery(id, "wfRoleCode");
  const existingWfRole = await WorkflowRole.findOne(query).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!existingWfRole) {
    throw new ApiError(404, "Invalid Workflow Role!!");
  }
  return existingWfRole;
};

const addWorkflowRoleService = async (body) => {
  const { WorkflowRole } = useModels();
  const { wfRoleCode, roleName, description, wfRoleType, canDelegate } = body;

  if (!wfRoleCode) {
    throw new ApiError(400, "Workflow Code is Mandatory!!");
  }

  const existingWfRoleCode = await WorkflowRole.findOne({
    wfRoleCode,
  }).populate("createdBy updatedBy", "fullName");
  if (existingWfRoleCode) {
    throw new ApiError(400, "Workflow Role Already Exists!!");
  }

  if (!description || !roleName || !wfRoleType) {
    throw new ApiError(
      400,
      "Description / Role Name / Workflow Role is Mandatory!!",
    );
  }

  const allowedTypes = ["initiator", "approver", "admin"];
  if (!allowedTypes.includes(wfRoleType?.toLowerCase())) {
    throw new ApiError(400, "Invalid Workflow Role Category!!");
  }

  const createWfRole = await WorkflowRole.create({
    wfRoleCode,
    roleName,
    description,
    wfRoleType,
    canDelegate: !!canDelegate,
  });

  if (!createWfRole) {
    throw new ApiError(500, "An Error Occured while creating Workflow Role!!");
  }
  if (createWfRole) {
    await createWfRole.populate("createdBy updatedBy", "fullName");
  }

  return createWfRole;
};

const updateWorkflowRoleService = async (id, body) => {
  const { WorkflowRole } = useModels();
  const { roleName, description, wfRoleType, canDelegate } = body;

  const query = getLookupQuery(id, "wfRoleCode");
  const existingWfRole = await WorkflowRole.findOne(query).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!existingWfRole) {
    throw new ApiError(404, "Workflow Role not Found!!");
  }

  if (!description || !roleName || !wfRoleType) {
    throw new ApiError(
      400,
      "Description / Role Name / Workflow Role is Mandatory!!",
    );
  }

  if (wfRoleType) {
    const allowedTypes = ["initiator", "approver", "admin"];
    if (!allowedTypes.includes(wfRoleType.toLowerCase())) {
      throw new ApiError(400, "Invalid Workflow Role Category!!");
    }
  }

  const updatedwfRole = await WorkflowRole.findByIdAndUpdate(
    existingWfRole._id,
    { $set: body },
    { new: true, runValidators: true },
  ).populate("createdBy updatedBy", "fullName");

  return updatedwfRole;
};

const toggleWorkflowRoleStatusService = async (id) => {
  const { WorkflowRole } = useModels();

  const query = getLookupQuery(id, "wfRoleCode");
  const existingWfRole = await WorkflowRole.findOne(query).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!existingWfRole) throw new ApiError(404, "Workflow Role not found");

  const { updatedRecord, successMessage } = await toggleStatus(
    WorkflowRole,
    existingWfRole._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getWorkflowRoleService,
  getWorkflowRoleByIdService,
  addWorkflowRoleService,
  updateWorkflowRoleService,
  toggleWorkflowRoleStatusService,
};
