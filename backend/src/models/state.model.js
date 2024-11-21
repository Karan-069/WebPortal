import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const stateSchema = new Schema(
  {
    stateCode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      unique: true,
    },
    shortName: {
      type: String,
    },
    gstCode: {
      type: String,
      required: true,
      unique: true,
    },
    region: {
      type: String,
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

stateSchema.plugin(mongoosePaginate);

export const State = mongoose.model("State", stateSchema);
