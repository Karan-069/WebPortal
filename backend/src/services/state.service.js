import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";

const getStatesService = async (query) => {
  const { State } = useModels();
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

  const stateData = await State.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
      populate: [
        { path: "createdBy", select: "fullName" },
        { path: "updatedBy", select: "fullName" },
      ],
    },
  );

  if (!stateData) {
    throw new ApiError(500, "Error while Fetching Data!!");
  }

  const { docs, totalDocs, totalPages, page, limit } = stateData;
  return { docs, totalDocs, totalPages, page, limit };
};

const getStateByIdService = async (stateCode) => {
  const { State } = useModels();
  const exisintgCode = await State.findOne({ stateCode }).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!exisintgCode) {
    throw new ApiError(400, "Invalid State Code!!");
  }
  return exisintgCode;
};

const addStateService = async (body) => {
  const { State } = useModels();
  const { stateCode, description, gstCode, shortName, region } = body;

  if (!stateCode || !description || !gstCode) {
    throw new ApiError(400, "Sate Code, Description, Gst Code are Mandatory!!");
  }

  const checkduplicate = await State.findOne({
    $or: [{ stateCode }, { description }, { gstCode }],
  });
  if (checkduplicate) {
    throw new ApiError(
      400,
      "State Code/ Description / Gst Code Already exists!!",
    );
  }

  const newStateCode = await State.create({
    stateCode,
    description,
    gstCode,
    region,
    shortName,
  });

  if (!newStateCode) {
    throw new ApiError(500, "Error while creating State!!");
  }

  if (newStateCode) {
    await newStateCode.populate("createdBy updatedBy", "fullName");
  }
  return newStateCode;
};

const updateStateService = async (stateCodeParam, body) => {
  const { State } = useModels();
  const { description, gstCode, shortName, region } = body; // Destructure body

  const exisitngState = await State.findOne({ stateCode: stateCodeParam });
  if (!exisitngState) {
    throw new ApiError(400, "Invalid State Code!!");
  }
  if (!description || !gstCode) {
    throw new ApiError(400, "Description, Gst Code are Mandatory!!");
  }

  const updatedState = await State.findByIdAndUpdate(
    exisitngState._id,
    {
      $set: body,
    },
    { new: true, runValidators: true },
  );
  if (updatedState) {
    await updatedState.populate("createdBy updatedBy", "fullName");
  }

  return updatedState;
};

const toggleStateStatusService = async (stateCodeParam) => {
  const { State } = useModels();
  const exisitngState = await State.findOne({ stateCode: stateCodeParam });
  if (!exisitngState) {
    throw new ApiError(400, "Invalid State Code!!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    State,
    exisitngState._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getStatesService,
  getStateByIdService,
  addStateService,
  updateStateService,
  toggleStateStatusService,
};
