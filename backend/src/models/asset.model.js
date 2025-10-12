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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

assetSchema.plugin(mongoosePaginate);

pre("save", async function (next) {
  if (this.isNew) {
    try {
      const nextAssetId = await NextTransactionId.findOneAndUpdate(
        { menuId: "asset" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true } // Create if it doesn't exist
      );

      const prefix = nextAssetId.prefix || "AS";
      this.assetId = `${prefix}-${String(nextAssetId.sequenceValue).padStart(
        3,
        "0"
      )}`;
      next();
    } catch (error) {
      next(error); // Pass error to next middleware
    }
  }
});

export const Asset = mongoose.model("Asset", assetSchema);
