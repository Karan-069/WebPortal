import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";

const getFeaturesService = async (query) => {
  const { Feature } = useModels();
  const {
    page: requestedPage = 1,
    limit: requestedLimit = 50,
    search = "",
  } = query;
  const pageNum = parseInt(requestedPage) > 0 ? parseInt(requestedPage) : 1;
  const limitNum = parseInt(requestedLimit) > 0 ? parseInt(requestedLimit) : 50;

  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const featureData = await Feature.paginate(filter, {
    page: pageNum,
    limit: limitNum,
    sort: { name: 1 },
  });

  return featureData;
};

const seedDefaultFeaturesService = async () => {
  const { Feature } = useModels();

  const modules = [
    "vendor",
    "client",
    "project",
    "item",
    "department",
    "subsidary",
    "userRole",
    "workflowRole",
    "user",
    "bill",
    "expense",
    "purchaseOrder",
    "payment",
    "journalEntry",
  ];

  const seedPromises = [];
  for (const mod of modules) {
    const wfKey = `WF_${mod.toUpperCase()}`;
    const autoIdKey = `AUTOID_${mod.toUpperCase()}`;

    seedPromises.push(
      (async () => {
        const exists = await Feature.findOne({ name: wfKey });
        if (!exists)
          await Feature.create({
            name: wfKey,
            isEnabled: false,
            description: `Enable Workflow for ${mod}`,
          });
      })(),
    );

    seedPromises.push(
      (async () => {
        const exists = await Feature.findOne({ name: autoIdKey });
        if (!exists)
          await Feature.create({
            name: autoIdKey,
            isEnabled: false,
            description: `Enable Auto-ID for ${mod}`,
          });
      })(),
    );
  }

  await Promise.all(seedPromises);
  return { message: "Features seeded successfully" };
};

const getFeatureMapService = async () => {
  const { Feature } = useModels();
  const features = await Feature.find({}).lean();

  // Convert array to Key-Value map for efficient frontend lookup
  const featureMap = {};
  features.forEach((f) => {
    featureMap[f.name] = f.isEnabled;
  });

  return featureMap;
};

const addFeatureService = async (body) => {
  const { Feature } = useModels();
  const { name, isEnabled, settings } = body;

  if (!name) {
    throw new ApiError(400, "Feature Name is Required");
  }

  const existingFeature = await Feature.findOne({ name });
  if (existingFeature) {
    throw new ApiError(400, "Feature already exists");
  }

  const feature = await Feature.create({ name, isEnabled, settings });
  return feature;
};

const getFeatureByIdService = async (id) => {
  const { Feature } = useModels();
  // Try finding by ID first, then by name if ID is not a valid ObjectId
  let feature;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    feature = await Feature.findById(id).populate(
      "createdBy updatedBy",
      "fullName",
    );
  } else {
    feature = await Feature.findOne({ name: id }).populate(
      "createdBy updatedBy",
      "fullName",
    );
  }

  if (!feature) {
    throw new ApiError(404, "Feature not found");
  }
  return feature;
};

const updateFeatureService = async (id, body) => {
  const { Feature } = useModels();

  let feature;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    feature = await Feature.findById(id);
  } else {
    feature = await Feature.findOne({ name: id });
  }

  if (!feature) {
    throw new ApiError(404, "Feature not found");
  }

  const updatedFeature = await Feature.findByIdAndUpdate(
    feature._id,
    { $set: body },
    { new: true, runValidators: true },
  ).populate("createdBy updatedBy", "fullName");

  return updatedFeature;
};

const toggleFeatureStatusService = async (id) => {
  const { Feature } = useModels();

  let feature;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    feature = await Feature.findById(id);
  } else {
    feature = await Feature.findOne({ name: id });
  }

  if (!feature) {
    throw new ApiError(404, "Feature not found");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    Feature,
    feature._id,
  );
  return { updatedRecord, successMessage };
};

export {
  getFeaturesService,
  addFeatureService,
  getFeatureByIdService,
  updateFeatureService,
  toggleFeatureStatusService,
  getFeatureMapService,
  seedDefaultFeaturesService,
};
