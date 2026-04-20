import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getLocationsService = async (query) => {
  const { Location } = useModels();
  const { page = 1, limit = 50, sortBy, sortOrder, search } = query;

  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const findQuery = {};
  if (search) {
    findQuery.$or = [
      { locationCode: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const locationData = await Location.paginate(findQuery, {
    page: pageNum,
    limit: limitNum,
    sort,
    populate: ["subsidary", "city", "state"],
  });

  const { docs, ...pagination } = locationData;
  return { data: docs, pagination };
};

const getLocationByIdService = async (id) => {
  const { Location } = useModels();
  const query = getLookupQuery(id, "locationCode");
  const location = await Location.findOne(query).populate([
    "subsidary",
    "city",
    "state",
  ]);
  if (!location) {
    throw new ApiError(404, "Location not found");
  }
  return location;
};

const addLocationService = async (body) => {
  const { Location } = useModels();
  const { locationCode } = body;

  const existing = await Location.findOne({ locationCode });
  if (existing) {
    throw new ApiError(400, "Location code already exists");
  }

  const newLocation = await Location.create(body);
  return await Location.findById(newLocation._id).populate([
    "subsidary",
    "city",
    "state",
  ]);
};

const updateLocationService = async (id, body) => {
  const { Location } = useModels();

  const query = getLookupQuery(id, "locationCode");
  const existing = await Location.findOne(query);
  if (!existing) throw new ApiError(404, "Location not found");

  const updated = await Location.findByIdAndUpdate(
    existing._id,
    { $set: body },
    { new: true, runValidators: true },
  ).populate(["subsidary", "city", "state"]);

  return updated;
};

const toggleLocationStatusService = async (id) => {
  const { Location } = useModels();
  const query = getLookupQuery(id, "locationCode");
  const existing = await Location.findOne(query);
  if (!existing) throw new ApiError(404, "Location not found");

  const { updatedRecord, successMessage } = await toggleStatus(
    Location,
    existing._id,
  );
  return { updatedRecord, successMessage };
};

export {
  getLocationsService,
  getLocationByIdService,
  addLocationService,
  updateLocationService,
  toggleLocationStatusService,
};
