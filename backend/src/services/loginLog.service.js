import { useModels } from "../utils/tenantContext.js";
import { ApiError } from "../utils/ApiError.js";

export const getLoginLogsService = async (queryParams) => {
  const { LoginLog } = useModels();
  const { page = 1, limit = 10, search = "", sortBy, sortOrder } = queryParams;
  const query = search
    ? { $or: [{ status: { $regex: search, $options: "i" } }] }
    : {};
  const sort = {};
  if (sortBy && sortOrder) sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  else sort.createdAt = -1;
  return await LoginLog.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: "userId",
  });
};

export const getLoginLogByIdService = async (id) => {
  const { LoginLog } = useModels();
  const record = await LoginLog.findById(id).populate("userId");
  if (!record) throw new ApiError(404, "LoginLog not found");
  return record;
};
