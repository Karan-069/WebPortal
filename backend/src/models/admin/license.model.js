import mongoose, { Schema } from "mongoose";
import { autoCodePlugin } from "../../utils/autoCodePlugin.js";
import { auditPlugin } from "../../utils/auditPlugin.js";

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
    maxCoreUsers: {
      type: Number,
      required: true,
      default: 5,
    },
    maxVendorUsers: {
      type: Number,
      required: true,
      default: 50,
    },
    maxUsers: {
      type: Number,
      default: 55, // Optional total cap
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

licenseSchema.plugin(auditPlugin);
licenseSchema.plugin(autoCodePlugin, { moduleName: "license" });
export const License = mongoose.model("License", licenseSchema);
