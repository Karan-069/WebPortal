import mongoose, { Schema } from "mongoose";
import { autoCodePlugin } from "../../utils/autoCodePlugin.js";

const licenseSchema = new Schema(
  {
    licenseCode: {
      type: String,
      unique: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    licenseType: {
      type: String,
      enum: ["free", "trial", "standard", "pro", "enterprise"],
      default: "standard",
    },
    maxUsers: {
      type: Number,
      required: true,
      default: 5,
    },
    expiryDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 Year
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

licenseSchema.plugin(autoCodePlugin, { moduleName: "license" });
export const License = mongoose.model("License", licenseSchema);
