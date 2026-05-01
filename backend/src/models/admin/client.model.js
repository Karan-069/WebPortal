import mongoose, { Schema } from "mongoose";
import { autoCodePlugin } from "../../utils/autoCodePlugin.js";

const clientSchema = new Schema(
  {
    clientCode: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    dbName: {
      type: String,
      required: true,
      unique: true,
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

clientSchema.plugin(autoCodePlugin, { moduleName: "client" });
export const Client = mongoose.model("Client", clientSchema);
