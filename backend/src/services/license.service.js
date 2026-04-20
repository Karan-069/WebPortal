import { useModels } from "../utils/tenantContext.js";
import { ApiError } from "../utils/ApiError.js";

const getLicensesService = async (queryParams) => {
  const { License } = useModels();
  const { page = 1, limit = 10 } = queryParams;

  // Global models usually use find comfortably, or we can use aggregate for better search
  const licenses = await License.find()
    .populate("clientId", "name slug")
    .sort({ createdAt: -1 });

  return {
    docs: licenses,
    totalDocs: licenses.length,
    totalPages: 1,
  };
};

const getLicenseByIdService = async (id) => {
  const { License } = useModels();
  const license = await License.findById(id).populate("clientId", "name slug");
  if (!license) throw new ApiError(404, "License not found");
  return license;
};

const createLicenseService = async (data) => {
  const { License } = useModels();
  return await License.create(data);
};

export { getLicensesService, getLicenseByIdService, createLicenseService };
