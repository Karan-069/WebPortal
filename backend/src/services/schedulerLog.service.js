import { useModels } from "../utils/tenantContext.js";
import { ApiError } from "../utils/ApiError.js";

export const getSchedulerLogsService = async (queryParams) => {
  const { SchedulerLog } = useModels();
  const { page = 1, limit = 10, search = "", sortBy, sortOrder } = queryParams;
  const query = search
    ? { $or: [{ description: { $regex: search, $options: "i" } }] }
    : {};
  const sort = {};
  if (sortBy && sortOrder) sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  else sort.createdAt = -1;
  return await SchedulerLog.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: { path: "masterId", select: "jobName" },
  });
};

export const getSchedulerLogByIdService = async (id) => {
  const { SchedulerLog } = useModels();
  const record = await SchedulerLog.findById(id).populate({
    path: "masterId",
    select: "jobName",
  });
  if (!record) throw new ApiError(404, "SchedulerLog not found");
  return record;
};

export const addSchedulerLogService = async (data) => {
  const { SchedulerLog } = useModels();
  return await SchedulerLog.create(data);
};

export const updateSchedulerLogService = async (id, data) => {
  const { SchedulerLog } = useModels();
  const record = await SchedulerLog.findByIdAndUpdate(id, data, { new: true });
  if (!record) throw new ApiError(404, "SchedulerLog not found");
  return record;
};

export const toggleSchedulerLogStatusService = async (id) => {
  const { SchedulerLog } = useModels();
  const record = await SchedulerLog.findById(id);
  if (!record) throw new ApiError(404, "SchedulerLog not found");

  if (record.isActive !== undefined) {
    record.isActive = !record.isActive;
  } else if (record.status !== undefined) {
    record.status = record.status === "active" ? "inactive" : "active";
  }
  await record.save();
  return { updatedRecord: record, successMessage: "Status toggled" };
};
