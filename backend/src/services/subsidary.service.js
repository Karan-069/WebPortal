import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getSubsidariesService = async (query) => {
  const { Subsidary } = useModels();
  const {
    page: requestedPage = 1,
    limit: requestedLimit = 50,
    search = "",
    sortBy,
    sortOrder,
  } = query;
  const pageNum = parseInt(requestedPage) > 0 ? parseInt(requestedPage) : 1;
  const limitNum = parseInt(requestedLimit) > 0 ? parseInt(requestedLimit) : 50;

  const filter = {};
  if (search) {
    filter.$or = [
      { subCode: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const subsidaryData = await Subsidary.paginate(filter, {
    page: pageNum,
    limit: limitNum,
    sort: sort,
    populate: [
      { path: "city", select: "cityCode description" },
      { path: "state", select: "stateCode description" },
      { path: "createdBy", select: "fullName" },
      { path: "updatedBy", select: "fullName" },
    ],
  });

  if (!subsidaryData) {
    throw new ApiError(500, "An Error Occured while fetching Data!!");
  }

  const { docs, totalDocs, totalPages, page, limit } = subsidaryData;
  return { docs, totalDocs, totalPages, page, limit };
};

const getSubsidaryByIdService = async (id) => {
  const { Subsidary } = useModels();
  if (!id) {
    throw new ApiError(400, "Subsidary ID/Code Missing!!");
  }

  const query = getLookupQuery(id, "subCode");
  const isSubsidaryValid = await Subsidary.findOne(query).populate([
    { path: "city", select: "cityCode description" },
    { path: "state", select: "stateCode description" },
    { path: "createdBy", select: "fullName" },
    { path: "updatedBy", select: "fullName" },
  ]);
  if (!isSubsidaryValid) {
    throw new ApiError(404, "Invalid Subisdiary!!");
  }

  return isSubsidaryValid;
};

const addSubsidaryService = async (body) => {
  const { Subsidary, City, State } = useModels();
  const { subCode, description, address1, address2, zipCode, city, state } =
    body;

  if (!subCode || !description || !city || !state) {
    throw new ApiError(
      400,
      "Subsidary Code, Descrpition, City and State are Mandatory!!",
    );
  }
  const isSubCodeExist = await Subsidary.findOne({ subCode });
  if (isSubCodeExist) {
    throw new ApiError(400, "Subsidary Code Already Exists!!");
  }

  if (!mongoose.Types.ObjectId.isValid(city)) {
    throw new ApiError(400, "InValid City Object ID!!");
  }
  if (!mongoose.Types.ObjectId.isValid(state)) {
    throw new ApiError(400, "InValid State Object ID!!");
  }

  const isCityValid = await City.findById(city);
  if (!isCityValid) {
    throw new ApiError(404, "InValid City!!");
  }
  const isStateValid = await State.findById(state);
  if (!isStateValid) {
    throw new ApiError(404, "InValid State!!");
  }

  const newSubsidary = await Subsidary.create({
    subCode,
    description,
    address1,
    address2,
    zipCode,
    city,
    state,
  });

  if (!newSubsidary) {
    throw new ApiError(500, "An Error Occured while creating Document!!");
  }

  return await Subsidary.findById(newSubsidary._id).populate([
    { path: "city", select: "cityCode description" },
    { path: "state", select: "stateCode description" },
    { path: "createdBy", select: "fullName" },
    { path: "updatedBy", select: "fullName" },
  ]);
};

const updateSubsidaryService = async (id, body) => {
  const { Subsidary, City, State } = useModels();
  const { description, address1, address2, city, state } = body;

  if (!description || !city || !state) {
    throw new ApiError(400, "Descrpition, City and State are Mandatory!!");
  }

  const query = getLookupQuery(id, "subCode");
  const isSubsidaryValid = await Subsidary.findOne(query);
  if (!isSubsidaryValid) {
    throw new ApiError(404, "Invalid Subsidary ID/Code!!");
  }

  if (!mongoose.Types.ObjectId.isValid(city)) {
    throw new ApiError(400, "InValid City Object ID!!");
  }
  if (!mongoose.Types.ObjectId.isValid(state)) {
    throw new ApiError(400, "InValid State Object ID!!");
  }

  const isCityValid = await City.findById(city);
  if (!isCityValid) {
    throw new ApiError(404, "InValid City!!");
  }
  const isStateValid = await State.findById(state);
  if (!isStateValid) {
    throw new ApiError(404, "InValid State!!");
  }

  const updateSubsidaryData = await Subsidary.findByIdAndUpdate(
    isSubsidaryValid._id,
    { $set: body },
    { new: true, runValidators: true },
  ).populate([
    { path: "city", select: "cityCode description" },
    { path: "state", select: "stateCode description" },
    { path: "createdBy", select: "fullName" },
    { path: "updatedBy", select: "fullName" },
  ]);

  if (!updateSubsidaryData) {
    throw new ApiError(500, "An error Occured while updating Document!");
  }

  return updateSubsidaryData;
};

const toggleSubsidaryStatusService = async (id) => {
  const { Subsidary } = useModels();
  const query = getLookupQuery(id, "subCode");
  const isSubsidaryValid = await Subsidary.findOne(query);
  if (!isSubsidaryValid) {
    throw new ApiError(404, "Invalid Subisdiary!!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    Subsidary,
    isSubsidaryValid._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getSubsidariesService,
  getSubsidaryByIdService,
  addSubsidaryService,
  updateSubsidaryService,
  toggleSubsidaryStatusService,
};
