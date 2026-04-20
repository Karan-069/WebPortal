import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { auditPlugin } from "../utils/auditPlugin.js";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

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
  },
);

crtermSchema.plugin(mongoosePaginate);
crtermSchema.plugin(auditPlugin);
crtermSchema.plugin(autoCodePlugin, { moduleName: "crterm" });

export const Crterm = mongoose.model("Crterm", crtermSchema);
export { crtermSchema };
