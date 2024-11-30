import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ApiError } from "../utils/ApiError.js";

const subsidarySchema = new Schema(
  {
    subCode: {
      type: String,
      required: [true, "Subsidary Code is Mandatory!!"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Subsidary Description is Mandatory!!"],
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
      required: [true, "City is Mandatory!!"],
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State is Mandatory!!"],
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

subsidarySchema.plugin(mongoosePaginate);

// Options to include virtuals when converting to JSON
subsidarySchema.set("toJSON", { virtuals: true });
subsidarySchema.set("toObject", { virtuals: true });

//Virtual for Full Address
subsidarySchema.virtual("fullAddress").get(function () {
  const parts = [
    this.address1,
    this.address2,
    this.city ? this.city.description : "",
    this.state ? this.state.description : "",
  ].filter(Boolean);
  return parts.join(", ");
});

subsidarySchema.methods.PopulateCityAndState = async function () {
  try {
    await this.populate([
      { path: "city", select: "description" },
      { path: "state", select: "description" },
    ]);

    return this.fullAddress;
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Error while Populating fullAddress Data!!"
    );
  }
};

export const Subsidary = mongoose.model("Subsidary", subsidarySchema);
