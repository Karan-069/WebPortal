import { useModels } from "../utils/tenantContext.js";
import { ApiError } from "../utils/ApiError.js";

export const getSchedulerMastersService = async (queryParams) => {
  const { SchedulerMaster } = useModels();
  const { page = 1, limit = 10, search = "", sortBy, sortOrder } = queryParams;
  const query = search
    ? { $or: [{ description: { $regex: search, $options: "i" } }] }
    : {};
  const sort = {};
  if (sortBy && sortOrder) sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  else sort.createdAt = -1;
  return await SchedulerMaster.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
  });
};

export const getSchedulerMasterByIdService = async (id) => {
  const { SchedulerMaster } = useModels();
  const record = await SchedulerMaster.findById(id);
  if (!record) throw new ApiError(404, "SchedulerMaster not found");
  return record;
};

export const addSchedulerMasterService = async (data) => {
  const { SchedulerMaster } = useModels();
  return await SchedulerMaster.create(data);
};

export const updateSchedulerMasterService = async (id, data) => {
  const { SchedulerMaster } = useModels();
  const record = await SchedulerMaster.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!record) throw new ApiError(404, "SchedulerMaster not found");
  return record;
};

export const toggleSchedulerMasterStatusService = async (id) => {
  const { SchedulerMaster } = useModels();
  const record = await SchedulerMaster.findById(id);
  if (!record) throw new ApiError(404, "SchedulerMaster not found");

  if (record.isActive !== undefined) {
    record.isActive = !record.isActive;
  } else if (record.status !== undefined) {
    record.status = record.status === "active" ? "inactive" : "active";
  }
  await record.save();
  return { updatedRecord: record, successMessage: "Status toggled" };
};
