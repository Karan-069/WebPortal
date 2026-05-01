import { useModels } from "../utils/tenantContext.js";
import { ApiError } from "../utils/ApiError.js";

export const getUserDelegationsService = async (queryParams) => {
  const { UserDelegation } = useModels();
  const { page = 1, limit = 10, search = "", sortBy, sortOrder } = queryParams;
  const query = search
    ? { $or: [{ description: { $regex: search, $options: "i" } }] }
    : {};
  const sort = {};
  if (sortBy && sortOrder) sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  else sort.createdAt = -1;
  return await UserDelegation.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
  });
};

export const getUserDelegationByIdService = async (id) => {
  const { UserDelegation } = useModels();
  const record = await UserDelegation.findById(id);
  if (!record) throw new ApiError(404, "UserDelegation not found");
  return record;
};

export const addUserDelegationService = async (data) => {
  const { UserDelegation } = useModels();
  return await UserDelegation.create(data);
};

export const updateUserDelegationService = async (id, data) => {
  const { UserDelegation } = useModels();
  const record = await UserDelegation.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!record) throw new ApiError(404, "UserDelegation not found");
  return record;
};

export const toggleUserDelegationStatusService = async (id) => {
  const { UserDelegation } = useModels();
  const record = await UserDelegation.findById(id);
  if (!record) throw new ApiError(404, "UserDelegation not found");

  if (record.isActive !== undefined) {
    record.isActive = !record.isActive;
  } else if (record.status !== undefined) {
    record.status = record.status === "active" ? "inactive" : "active";
  }
  await record.save();
  return { updatedRecord: record, successMessage: "Status toggled" };
};
