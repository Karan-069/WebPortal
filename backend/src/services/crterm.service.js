import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getCrtermsService = async (query) => {
  const { Crterm } = useModels();
  const {
    page: requestedPage = 1,
    limit: requestedLimit = 50,
    sortBy,
    sortOrder,
  } = query;
  const pageNum = parseInt(requestedPage) > 0 ? parseInt(requestedPage) : 1;
  const limitNum = parseInt(requestedLimit) > 0 ? parseInt(requestedLimit) : 50;

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const termsData = await Crterm.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    },
  );

  const { docs, totalDocs, totalPages, page, limit } = termsData;
  return { docs, totalDocs, totalPages, page, limit };
};

const getCrtermByIdService = async (id) => {
  const { Crterm } = useModels();
  const query = getLookupQuery(id, "termCode");
  const checkTerm = await Crterm.findOne(query).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!checkTerm) {
    throw new ApiError(400, "Invalid Credit Term!!");
  }
  return checkTerm;
};

const addCrtermService = async (body) => {
  const { Crterm } = useModels();
  const { termCode, description, days } = body;

  if (!termCode || !description || !days) {
    throw new ApiError(400, "All Fields are Mandatory!!");
  }
  const checkTermCode = await Crterm.findOne({ termCode });
  if (checkTermCode) {
    throw new ApiError(400, "Credit Term Code Already Exists!!");
  }

  const newCrterm = await Crterm.create({
    termCode,
    description,
    days,
  });

  if (newCrterm) {
    await newCrterm.populate("createdBy updatedBy", "fullName");
  }

  return newCrterm;
};

const updateCrtermService = async (id, body) => {
  const { Crterm } = useModels();
  const { description, days } = body;

  const query = getLookupQuery(id, "termCode");
  const checkTermCode = await Crterm.findOne(query);
  if (!checkTermCode) {
    throw new ApiError(400, "Invalid Credit Term !!");
  }

  if (!days) {
    throw new ApiError(400, "Days are Mandatory!!");
  }

  const updatedCrterm = await Crterm.findOneAndUpdate(
    { _id: checkTermCode._id },
    {
      $set: body,
    },
    { new: true, runValidators: true },
  ).populate("createdBy updatedBy", "fullName");

  if (!updatedCrterm) {
    throw new ApiError(500, "An Error Occured while Updating Credit Term!!");
  }

  return updatedCrterm;
};

const toggleCrtermStatusService = async (id) => {
  const { Crterm } = useModels();
  const query = getLookupQuery(id, "termCode");
  const checkTermCode = await Crterm.findOne(query);
  if (!checkTermCode) {
    throw new ApiError(400, "Invalid Credit Term !!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    Crterm,
    checkTermCode._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getCrtermsService,
  getCrtermByIdService,
  addCrtermService,
  updateCrtermService,
  toggleCrtermStatusService,
};
