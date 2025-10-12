import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const locationSchema = new Schema(
  {
    locationCode: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    subsidary: {
      type: Schema.Types.ObjectId,
      ref: "Subsidary",
      required: true,
    },
    address1: {
      type: String,
    },
    address2: {
      type: String,
    },
    zipCode: {
      type: Number,
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
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

locationSchema.plugin(mongoosePaginate);

export const Location = mongoose.model("Location", locationSchema);
