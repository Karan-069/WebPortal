import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import mongoose from "mongoose";

const getCitiesService = async (query) => {
  const models = useModels();
  const { City } = models;
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

  const getCitiesData = await City.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
      populate: { path: "createdBy updatedBy", select: "fullName" },
    },
  );

  for (let city of getCitiesData.docs) {
    if (city.PopulateState) {
      await city.PopulateState();
    }
  }

  const { docs, totalDocs, totalPages, page, limit } = getCitiesData;
  return { docs, totalDocs, totalPages, page, limit };
};

const getCityByIdService = async (cityCode) => {
  const { City } = useModels();
  if (!cityCode) {
    throw new ApiError(400, "Invalid City Code!!");
  }
  const existingCity = await City.findOne({ cityCode }).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!existingCity) {
    throw new ApiError(404, "City Not Found!!");
  }

  if (existingCity.PopulateState) {
    await existingCity.PopulateState();
  }

  return existingCity;
};

const addCityService = async (body) => {
  const { City, State } = useModels();
  const { cityCode, description, shortName, stateCode } = body;

  if (!cityCode || !description || !stateCode) {
    throw new ApiError(
      400,
      "Sate Code, Description, City Code are Mandatory!!",
    );
  }

  const chkCity = await City.findOne({
    $or: [{ cityCode }, { description }],
  });
  if (chkCity) {
    throw new ApiError(400, "City Code / Description Already Exists!!");
  }

  if (!mongoose.Types.ObjectId.isValid(stateCode)) {
    throw new ApiError(400, "Invalid State Object ID!!");
  }
  const chkState = await State.findById(stateCode);
  if (!chkState) {
    throw new ApiError(400, "Invalid State Code!!");
  }

  const newCity = await City.create({
    cityCode,
    description,
    shortName,
    stateCode,
  });

  if (!newCity) {
    throw new ApiError(500, "An Error Occured while adding City!!");
  }
  if (newCity) {
    await newCity.populate("createdBy updatedBy", "fullName");
  }

  if (newCity.PopulateState) {
    await newCity.PopulateState();
  }

  return newCity;
};

const updateCityService = async (cityCode, body) => {
  const { City, State } = useModels();
  const { description, shortName, stateCode } = body;

  if (!description || !stateCode) {
    throw new ApiError(400, "Sate Code, Description are Mandatory!!");
  }

  const existingCity = await City.findOne({ cityCode }).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!existingCity) {
    throw new ApiError(400, "Invalid City!!");
  }

  const chkState = await State.findById(stateCode);
  if (!chkState) {
    throw new ApiError(400, "Invalid State Code!!");
  }

  const updatedCity = await City.findByIdAndUpdate(
    existingCity._id,
    { $set: body },
    { new: true, runValidators: true },
  );
  if (!updatedCity) {
    throw new ApiError(500, "Error while Updating City Record!!");
  }
  if (updatedCity) {
    await updatedCity.populate("createdBy updatedBy", "fullName");
  }

  if (updatedCity.PopulateState) {
    await updatedCity.PopulateState();
  }

  return updatedCity;
};

const toggleCityStatusService = async (cityCode) => {
  const { City } = useModels();
  const chkCityCode = await City.findOne({ cityCode });
  if (!chkCityCode) {
    throw new ApiError(400, "Invalid City!!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    City,
    chkCityCode._id,
  );

  if (updatedRecord.PopulateState) {
    await updatedRecord.PopulateState();
  }

  return { updatedRecord, successMessage };
};

export {
  getCitiesService,
  getCityByIdService,
  addCityService,
  updateCityService,
  toggleCityStatusService,
};
