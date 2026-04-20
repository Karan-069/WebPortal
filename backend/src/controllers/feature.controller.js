import { useModels } from "../utils/tenantContext.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getFeatures = async (req, res) => {
  const { Feature } = useModels();

  // Ensure the default "itemCodeAutoGenerate" feature exists
  let autoGenFeature = await Feature.findOne({ name: "itemCodeAutoGenerate" });

  if (!autoGenFeature) {
    autoGenFeature = await Feature.create({
      name: "itemCodeAutoGenerate",
      isEnabled: true, // As requested, default to True
    });
  }

  // Ensure "itemWorkflowEnabled" exists
  let itemWorkflowFeature = await Feature.findOne({
    name: "itemWorkflowEnabled",
  });
  if (!itemWorkflowFeature) {
    itemWorkflowFeature = await Feature.create({
      name: "itemWorkflowEnabled",
      isEnabled: false, // Default to false until configured
    });
  }

  const features = await Feature.find();
  return res
    .status(200)
    .json(new ApiResponse(200, features, "Features fetched successfully"));
};

const updateFeature = async (req, res) => {
  const { Feature } = useModels();
  const { name, isEnabled } = req.body;

  if (!name) {
    throw new ApiError(400, "Feature name is required");
  }

  const feature = await Feature.findOneAndUpdate(
    { name },
    { isEnabled },
    { new: true, upsert: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, feature, "Feature updated successfully"));
};

export { getFeatures, updateFeature };
