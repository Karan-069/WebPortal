import mongoose, { Schema } from "mongoose";

const featureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

export { featureSchema };
