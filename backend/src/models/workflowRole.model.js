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
    description: {
      type: String,
      required: [true, "Description is Mandatory!!"],
    },
    wfRoleType: {
      type: [String],
      enum: ["submit", "approve", "reject", "delegate"],
      required: [true, "Workflow Role Type is Mandatory!!"],
      lowercase: true,
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

workflowRoleSchema.plugin(mongoosePaginate);

export const WorkflowRole = mongoose.model("WorkflowRole", workflowRoleSchema);
