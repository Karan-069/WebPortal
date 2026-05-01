import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

const emailTemplateSchema = new Schema(
  {
    templateCode: {
      type: String,
      unique: true,
      index: true,
    },
    templateName: {
      type: String,
      required: [true, "Template Name is Mandatory!!"],
      unique: true,
      trim: true,
      uppercase: true, // E.g., WORKFLOW_REJECTED, WORKFLOW_APPROVED
    },
    subject: {
      type: String,
      required: [true, "Subject is Mandatory!!"],
    },
    htmlBody: {
      type: String,
      required: [true, "HTML Body is Mandatory!!"],
    },
    defaultCcRecipients: {
      type: [String],
      default: [],
    },
    defaultBccRecipients: {
      type: [String],
      default: [],
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

emailTemplateSchema.plugin(mongoosePaginate);
emailTemplateSchema.plugin(autoCodePlugin, { moduleName: "emailTemplate" });

export const EmailTemplate = mongoose.model(
  "EmailTemplate",
  emailTemplateSchema,
);
export { emailTemplateSchema };
