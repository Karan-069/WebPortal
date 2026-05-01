import { ApiError } from "../utils/ApiError.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getDashboardConfigsService = async (query) => {
  const { DashboardConfig } = useModels();
  const {
    page: requestedPage = 1,
    limit: requestedLimit = 50,
    search = "",
  } = query;
  const pageNum = parseInt(requestedPage) > 0 ? parseInt(requestedPage) : 1;
  const limitNum = parseInt(requestedLimit) > 0 ? parseInt(requestedLimit) : 50;

  const filter = {};
  if (search) {
    filter.roleName = { $regex: search, $options: "i" };
  }

  const result = await DashboardConfig.paginate(filter, {
    page: pageNum,
    limit: limitNum,
    sort: { roleName: 1 },
  });

  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page,
    limit: result.limit,
  };
};

const addDashboardConfigService = async (body) => {
  const { DashboardConfig } = useModels();
  const { roleName, layout } = body;

  if (!roleName) {
    throw new ApiError(400, "Role Name is required");
  }

  const existing = await DashboardConfig.findOne({ roleName });
  if (existing) {
    throw new ApiError(
      400,
      "Dashboard configuration for this role already exists",
    );
  }

  const config = await DashboardConfig.create({ roleName, layout });
  return config;
};

const getDashboardConfigByIdService = async (id) => {
  const { DashboardConfig } = useModels();
  const query = getLookupQuery(id, "roleName");
  const config = await DashboardConfig.findOne(query);
  if (!config) {
    throw new ApiError(404, "Dashboard configuration not found");
  }
  return config;
};

const updateDashboardConfigService = async (id, body) => {
  const { DashboardConfig } = useModels();
  const query = getLookupQuery(id, "roleName");

  const config = await DashboardConfig.findOneAndUpdate(
    query,
    { $set: body },
    { new: true, runValidators: true },
  );

  if (!config) {
    throw new ApiError(404, "Dashboard configuration not found");
  }
  return config;
};

const deleteDashboardConfigService = async (id) => {
  const { DashboardConfig } = useModels();
  const query = getLookupQuery(id, "roleName");

  const config = await DashboardConfig.findOneAndDelete(query);

  if (!config) {
    throw new ApiError(404, "Dashboard configuration not found");
  }
  return config;
};

export {
  getDashboardConfigsService,
  addDashboardConfigService,
  getDashboardConfigByIdService,
  updateDashboardConfigService,
  deleteDashboardConfigService,
};
