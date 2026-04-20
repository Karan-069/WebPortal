import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    smtpSettings: {
      host: { type: String },
      port: { type: Number },
      user: { type: String },
      pass: { type: String },
      fromEmail: { type: String },
    },
    enabledModules: {
      type: [String], // Array of menuId
      default: ["dashboard", "item", "vendor", "bill"],
    },
    isMaintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Settings = mongoose.model("Settings", settingsSchema);
