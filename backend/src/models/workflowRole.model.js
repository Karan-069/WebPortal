import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const workflowRoleSchema = new Schema(
  {
    wfRoleCode: {
      type: String,
      required: [true, "Workflow Role Code is Mandatory!!"],
      unique: true,
      trim: true,
    },
    roleName: {
      type: String,
      required: [true, "Role Name is Mandatory!!"],
    },
    description: {
      type: String,
      required: [true, "Description is Mandatory!!"],
    },
    wfRoleType: {
      type: String,
      enum: ["initiator", "approver", "admin"],
      required: [true, "Workflow Role Category is Mandatory!!"],
      lowercase: true,
    },
    canDelegate: {
      type: Boolean,
      default: false,
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

import { auditPlugin } from "../utils/auditPlugin.js";
workflowRoleSchema.plugin(auditPlugin);
workflowRoleSchema.plugin(mongoosePaginate);

export const WorkflowRole = mongoose.model("WorkflowRole", workflowRoleSchema);
export { workflowRoleSchema };
