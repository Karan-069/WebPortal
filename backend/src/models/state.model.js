import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { auditPlugin } from "../utils/auditPlugin.js";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

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
  },
);

stateSchema.plugin(mongoosePaginate);
stateSchema.plugin(auditPlugin);
stateSchema.plugin(autoCodePlugin, { moduleName: "state" });

// export const State = mongoose.model("State", stateSchema);
export { stateSchema };
