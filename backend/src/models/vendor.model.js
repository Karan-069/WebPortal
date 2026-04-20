import mongoose, { Schema, SchemaType } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ApiError } from "../utils/ApiError.js";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

const vendorSchema = new Schema(
  {
    vendorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full Name is Mandatory!!"],
      unique: true,
      trim: true,
    },
    address1: {
      type: String,
    },
    address2: {
      type: String,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
    },
    country: {
      type: String,
    },
    registrationType: {
      type: String,
      enum: ["unregistered", "regular", "compositeDealer", "overseas", "sez"],
      required: [true, "Registration Type is Mandatory!!"],
    },
    registrationNo: {
      type: String,
      unique: true,
    },
    panNo: {
      type: String,
      unique: true,
    },
    subsidary: {
      type: Schema.Types.ObjectId,
      ref: "Subsidary",
      index: true,
    },
    crterm: {
      type: Schema.Types.ObjectId,
      ref: "Crterm",
      required: [true, "Credit Term is Mandatory!!"],
      index: true,
    },
    currency: {
      type: String,
      required: [true, "Currency is Mandatory!!"],
    },
    isMsme: {
      type: Boolean,
      default: false,
    },
    msmeNo: {
      type: String,
    },
    msmeIssueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value <= Date.now(); // Ensure it's not a future date
        },
        message: "MSME Issue Date cannot be in the future.",
      },
    },
    contactPerson: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      index: true,
    },
    gstNo: {
      type: String,
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
    beneficiaryName: {
      type: String,
      trim: true,
    },
    linkedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    workflowStatus: {
      type: String,
      enum: [
        "Draft",
        "Pending Approval",
        "Approved",
        "Rejected",
        "Clarification",
      ],
      default: "Draft",
      index: true,
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

// Options to include virtuals when converting to JSON
vendorSchema.set("toJSON", { virtuals: true });
vendorSchema.set("toObject", { virtuals: true });

//Virtual for Full Address
vendorSchema.virtual("fullAddress").get(function () {
  const parts = [
    this.address1,
    this.address2,
    this.city ? this.city.description : "",
    this.state ? this.state.description : "",
    this.country,
  ].filter(Boolean);
  return parts.join(", ");
});

//Method to retrive fullAddress
vendorSchema.methods.getFullAddress = async function () {
  try {
    await this.populate({
      path: "city",
      select: "descrption",
    })
      .populate({
        path: "state",
        select: "description",
      })
      .execPopulate();
    return this.fullAddress;
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Error while Populating Vendor Data!!",
    );
  }
};

// Universal Auto-Code Generation replaces custom logic below
vendorSchema.plugin(autoCodePlugin, { moduleName: "vendor" });

import { auditPlugin } from "../utils/auditPlugin.js";
vendorSchema.plugin(auditPlugin);
vendorSchema.plugin(mongoosePaginate);

export const Vendor = mongoose.model("Vendor", vendorSchema);
export { vendorSchema };
