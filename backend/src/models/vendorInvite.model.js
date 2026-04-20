import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

const vendorInviteSchema = new Schema(
  {
    inviteNo: {
      type: String,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, "Company Name is required!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      lowercase: true,
      trim: true,
    },
    panNo: {
      type: String,
      required: [true, "PAN No is required!"],
      uppercase: true,
      trim: true,
      unique: true, // Needs to be unique across all active invites
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Registered", "Expired"],
      default: "Pending",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

vendorInviteSchema.plugin(mongoosePaginate);
vendorInviteSchema.plugin(autoCodePlugin, { moduleName: "vendorInvite" });

export const VendorInvite = mongoose.model("VendorInvite", vendorInviteSchema);
export { vendorInviteSchema };
