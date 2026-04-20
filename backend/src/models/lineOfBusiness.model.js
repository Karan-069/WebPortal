import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { auditPlugin } from "../utils/auditPlugin.js";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

const lineOfBusinessSchema = new Schema(
  {
    lobCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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

lineOfBusinessSchema.plugin(mongoosePaginate);
lineOfBusinessSchema.plugin(auditPlugin);
lineOfBusinessSchema.plugin(autoCodePlugin, { moduleName: "lineOfBusiness" });

export const LineOfBusiness = mongoose.model(
  "LineOfBusiness",
  lineOfBusinessSchema,
);
export { lineOfBusinessSchema };
