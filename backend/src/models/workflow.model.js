import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";
import { auditPlugin } from "../utils/auditPlugin.js";

// Workflow Stage Schema
const workflowStageSchema = new Schema(
  {
    // NOTE: workflowId removed — it's redundant inside an embedded subdocument array
    stageNumber: {
      type: Number,
      required: true,
    },
    stageName: {
      type: String,
      required: true,
    },
    stageApproverRole: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowRole",
    },
    isStatic: {
      type: Boolean,
      default: false,
    },
    specificApprover: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isNotificationOnly: {
      type: Boolean,
      default: false,
    },
    // Email recipients defined at the stage level
    notificationRecipients: [
      {
        email: { type: String, trim: true, lowercase: true },
        type: { type: String, enum: ["to", "cc", "bcc"], default: "to" },
      },
    ],
    minAmount: {
      type: mongoose.Types.Decimal128,
      default: 0,
    },
    maxAmount: {
      type: mongoose.Types.Decimal128,
      default: 0,
    },
    mandatoryFields: [
      {
        fieldName: { type: String, required: true },
        roleId: { type: Schema.Types.ObjectId, ref: "WorkflowRole" }, // Optional: only mandatory for this role
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Workflow Schema
const workflowSchema = new Schema(
  {
    workflowCode: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is Mandatory!!"],
      unique: true,
    },
    workflowType: {
      type: String,
      enum: ["transaction", "master"],
      default: "transaction",
    },
    transactionType: {
      type: String,
      required: [true, "Transaction Type is Mandatory!!"],
      trim: true,
    },
    moduleContext: {
      type: Schema.Types.Mixed, // E.g., ObjectId for department/subsidiary, or String enum
    },
    initiatorRole: {
      type: Schema.Types.ObjectId,
      ref: "UserRole",
      required: [true, "Inititator Role is Mandatory!!"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    WorkflowStage: [workflowStageSchema],
  },
  {
    timestamps: true,
  },
);

// Unique index for stage names within a workflow
workflowSchema.index({ "WorkflowStage.stageNumber": 1 });

workflowSchema.methods.populateDetails = async function () {
  return await this.populate({
    path: "initiatorRole",
    select: "roleName permissions",
  })
    .populate({
      path: "WorkflowStage.stageApproverRole",
    })
    .lean();
};

workflowSchema.plugin(auditPlugin);
workflowSchema.plugin(mongoosePaginate);
workflowSchema.plugin(autoCodePlugin, { moduleName: "workflow" });

export const Workflow = mongoose.model("Workflow", workflowSchema);
export { workflowSchema };
