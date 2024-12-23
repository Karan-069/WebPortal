import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const crtermSchema = new Schema(
  {
    termCode: {
      type: String,
      required: [true, "Code is Mandatory!!"],
      unique: true,
    },
    description: {
      type: String,
    },
    days: {
      type: Number,
      required: [true, "Number of Days are Mandatory!!"],
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

crtermSchema.plugin(mongoosePaginate);

export const Crterm = mongoose.model("Crterm", crtermSchema);
