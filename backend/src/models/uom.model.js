import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";
import { auditPlugin } from "../utils/auditPlugin.js";

const uomSchema = new Schema(
  {
    uomCode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
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

uomSchema.plugin(mongoosePaginate);
uomSchema.plugin(autoCodePlugin, { moduleName: "uom" });
uomSchema.plugin(auditPlugin);

export const Uom = mongoose.model("Uom", uomSchema);
export { uomSchema };
