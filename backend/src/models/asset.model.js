import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const assetSchema = new Schema(
  {
    assetId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    assetCode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
    },
    assetCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
    },
    assetLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    name: {
      type: String,
    },
    make: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    serial: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    warrantyExpiry: {
      type: Date,
    },
    assignedUser: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      enum: ["Good", "Faulty"],
      default: "Good",
    },
    remarks: {
      type: String,
      trim: true,
    },
    photo: {
      type: String, // URL to uploaded image
    },
    qrCode: {
      type: String, // Base64 QR code
    },
    barcode: {
      type: String, // Base64 barcode
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

import { auditPlugin } from "../utils/auditPlugin.js";
assetSchema.plugin(auditPlugin);
assetSchema.plugin(mongoosePaginate);

assetSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // NextTransactionId is on the same connection — use this.constructor.db
      const NextTransactionId = this.db.model("NextTransactionId");
      const nextAssetId = await NextTransactionId.findOneAndUpdate(
        { menuId: "asset" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true },
      );

      const prefix = nextAssetId.prefix || "AS";
      this.assetId = `${prefix}-${String(nextAssetId.sequenceValue).padStart(
        3,
        "0",
      )}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export const Asset = mongoose.model("Asset", assetSchema);
export { assetSchema };
