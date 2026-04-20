import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { auditPlugin } from "../utils/auditPlugin.js";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

const assetCategorySchema = new Schema(
  {
    catCode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

assetCategorySchema.plugin(mongoosePaginate);
assetCategorySchema.plugin(auditPlugin);
assetCategorySchema.plugin(autoCodePlugin, { moduleName: "assetCategory" });

export const AssetCategory = mongoose.model(
  "AssetCategory",
  assetCategorySchema,
);
export { assetCategorySchema };
