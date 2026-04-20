import { ApiError } from "../utils/ApiError.js";
import { useModels } from "../utils/tenantContext.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getCOAsService = async (query) => {
  const { ChartOfAccounts } = useModels();
  const { page = 1, limit = 50, sortBy, sortOrder } = query;

  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const coas = await ChartOfAccounts.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort,
    },
  );

  const { docs, ...pagination } = coas;
  return { data: docs, pagination };
};

const getCOAByIdService = async (id) => {
  const { ChartOfAccounts } = useModels();
  const query = getLookupQuery(id, "coaCode");
  const coa = await ChartOfAccounts.findOne(query).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!coa) {
    throw new ApiError(404, "Chart of Accounts not Found!!");
  }
  return coa;
};

const addCOAService = async (body) => {
  const { ChartOfAccounts } = useModels();

  const existingCOA = await ChartOfAccounts.findOne({ coaCode: body.coaCode });
  if (existingCOA) {
    throw new ApiError(400, "Chart of Accounts code already exists!!");
  }

  const newCOA = await ChartOfAccounts.create(body);

  if (newCOA) {
    await newCOA.populate("createdBy updatedBy", "fullName");
  }

  return newCOA;
};

const updateCOAService = async (id, body) => {
  const { ChartOfAccounts } = useModels();
  const query = getLookupQuery(id, "coaCode");

  const existingCOA = await ChartOfAccounts.findOne(query);
  if (!existingCOA) {
    throw new ApiError(404, "Chart of Accounts not Found!!");
  }

  const updatedCOA = await ChartOfAccounts.findByIdAndUpdate(
    existingCOA._id,
    { $set: body },
    { new: true, runValidators: true },
  ).populate("createdBy updatedBy", "fullName");

  if (!updatedCOA) {
    throw new ApiError(500, "Failed Updating Chart of Accounts!!");
  }

  return updatedCOA;
};

const toggleCOAStatusService = async (id) => {
  const { ChartOfAccounts } = useModels();
  const query = getLookupQuery(id, "coaCode");

  const existingCOA = await ChartOfAccounts.findOne(query);
  if (!existingCOA) throw new ApiError(404, "Chart of Accounts not found");

  const { updatedRecord, successMessage } = await toggleStatus(
    ChartOfAccounts,
    existingCOA._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getCOAsService,
  getCOAByIdService,
  addCOAService,
  updateCOAService,
  toggleCOAStatusService,
};
