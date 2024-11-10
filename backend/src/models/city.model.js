import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const citySchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      unique: true,
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

export const City = mongoose.model("City", citySchema);
