import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ApiError } from "../utils/ApiError.js";

const citySchema = new Schema(
  {
    cityCode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
    },
    stateCode: {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State Code is Mandatory!!"],
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

citySchema.plugin(mongoosePaginate);

citySchema.methods.PopulateState = async function () {
  try {
    await this.populate({
      path: "stateCode",
      select: "description",
    });
    return this;
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "An Error occured while Populating State!!"
    );
  }
};

export const City = mongoose.model("City", citySchema);
