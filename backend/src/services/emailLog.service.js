import { useModels } from "../utils/tenantContext.js";

const getEmailLogsService = async (queryParams) => {
  const { EmailLog } = useModels();
  const { page = 1, limit = 10, search = "", status = "" } = queryParams;

  const query = {};
  if (search) {
    query.$or = [
      { recipient: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { eventName: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    query.status = status;
  }

  const result = await EmailLog.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
  });

  return result;
};

const getEmailLogByIdService = async (id) => {
  const { EmailLog } = useModels();
  return await EmailLog.findById(id);
};

export { getEmailLogsService, getEmailLogByIdService };
