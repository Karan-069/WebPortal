import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { auditPlugin } from "../utils/auditPlugin.js";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

const departmentSchema = new Schema(
  {
    deptCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    departmentHead: {
      type: String,
    },
    location: {
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

departmentSchema.plugin(mongoosePaginate);
departmentSchema.plugin(auditPlugin);
departmentSchema.plugin(autoCodePlugin, { moduleName: "department" });

export const Department = mongoose.model("Department", departmentSchema);
export { departmentSchema };
