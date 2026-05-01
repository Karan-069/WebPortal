import { ApiError } from "../utils/ApiError.js";
import { useModels } from "../utils/tenantContext.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getLOBsService = async (query) => {
  const { LineOfBusiness } = useModels();
  const { page = 1, limit = 50, sortBy, sortOrder } = query;

  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const lobs = await LineOfBusiness.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort,
    },
  );

  const { docs, ...pagination } = lobs;
  return { docs, ...pagination };
};

const getLOBByIdService = async (id) => {
  const { LineOfBusiness } = useModels();
  const query = getLookupQuery(id, "lobCode");
  const lob = await LineOfBusiness.findOne(query).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!lob) {
    throw new ApiError(404, "Line of Business not Found!!");
  }
  return lob;
};

const addLOBService = async (body) => {
  const { LineOfBusiness } = useModels();

  const existingLOB = await LineOfBusiness.findOne({ lobCode: body.lobCode });
  if (existingLOB) {
    throw new ApiError(400, "Line of Business code already exists!!");
  }

  const newLOB = await LineOfBusiness.create(body);

  if (newLOB) {
    await newLOB.populate("createdBy updatedBy", "fullName");
  }

  return newLOB;
};

const updateLOBService = async (id, body) => {
  const { LineOfBusiness } = useModels();
  const query = getLookupQuery(id, "lobCode");

  const existingLOB = await LineOfBusiness.findOne(query);
  if (!existingLOB) {
    throw new ApiError(404, "Line of Business not Found!!");
  }

  const updatedLOB = await LineOfBusiness.findByIdAndUpdate(
    existingLOB._id,
    { $set: body },
    { new: true, runValidators: true },
  ).populate("createdBy updatedBy", "fullName");

  if (!updatedLOB) {
    throw new ApiError(500, "Failed Updating Line of Business!!");
  }

  return updatedLOB;
};

const toggleLOBStatusService = async (id) => {
  const { LineOfBusiness } = useModels();
  const query = getLookupQuery(id, "lobCode");

  const existingLOB = await LineOfBusiness.findOne(query);
  if (!existingLOB) throw new ApiError(404, "Line of Business not found");

  const { updatedRecord, successMessage } = await toggleStatus(
    LineOfBusiness,
    existingLOB._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getLOBsService,
  getLOBByIdService,
  addLOBService,
  updateLOBService,
  toggleLOBStatusService,
};
