import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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
  }
);

assetCategorySchema.plugin(mongoosePaginate);

export const AssetCategory = mongoose.model(
  "AssetCategory",
  assetCategorySchema
);
