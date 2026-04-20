import { useModels } from "../utils/tenantContext.js";
import { ApiError } from "../utils/ApiError.js";

const getSettingsService = async (queryParams) => {
  const { Settings } = useModels();

  // Settings is usually 1-to-1 with client
  const settings = await Settings.find()
    .populate("clientId", "name slug")
    .sort({ createdAt: -1 });

  return {
    docs: settings,
    totalDocs: settings.length,
    totalPages: 1,
  };
};

const getSettingsByIdService = async (id) => {
  const { Settings } = useModels();
  const settings = await Settings.findById(id).populate(
    "clientId",
    "name slug",
  );
  if (!settings) throw new ApiError(404, "Settings not found");
  return settings;
};

const updateSettingsService = async (id, data) => {
  const { Settings } = useModels();
  const settings = await Settings.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!settings) throw new ApiError(404, "Settings not found");
  return settings;
};

export { getSettingsService, getSettingsByIdService, updateSettingsService };
