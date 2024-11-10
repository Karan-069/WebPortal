import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const workflowRoleSchema = new Schema(
  {
    roleCode: {
      type: String,
      required: [true, "Role Code is Mandatory!!"],
      unique: true,
    },
    description: {
      type: String,
    },
    roleType: {
      type: [String],
      enum: ["submit", "approve", "reject", "delegate"],
      required: [true, "Role Type is Mandatory!!"],
    },
  },
  {
    timestamps: true,
  }
);

workflowRoleSchema.plugin(mongoosePaginate);

export const WorkflowRole = mongoose.model("WorkflowRole", workflowRoleSchema);
