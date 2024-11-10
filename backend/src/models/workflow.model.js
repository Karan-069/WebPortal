import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Workflow Stage Schema
const workflowStageSchema = new Schema(
  {
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    stageNumber: {
      type: Number,
      required: true,
    },
    stageName: {
      type: String,
      required: true,
      unique: true,
    },
    stageApproverRole: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowRole",
      required: true,
    },
    minAmount: {
      type: mongoose.Types.Decimal128,
      required: true,
      min: [0, "minAmount must be a positive number"],
    },
    maxAmount: {
      type: mongoose.Types.Decimal128,
      required: true,
      min: [0, "maxAmount must be a positive number"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save validation for amount fields
workflowStageSchema.pre("save", function (next) {
  if (this.minAmount >= this.maxAmount) {
    return next(new Error("minAmount must be less than maxAmount"));
  }
  next();
});

// Unique index for stage names within a workflow
workflowStageSchema.index({ workflowId: 1, stageName: 1 }, { unique: true });

// Workflow Schema
const workflowSchema = new Schema(
  {
    description: {
      type: String,
      required: [true, "Description is Mandatory!!"],
      unique: true,
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
  }
);

workflowSchema.methods.populateDetails = async function () {
  return await this.populate({
    path: "initiatorRole",
    select: "roleName permissions",
  })
    .populate({
      path: "workflowStages.stageApproverRole",
    })
    .lean();
};

workflowSchema.plugin(mongoosePaginate);

//Models
const WorkflowStage = mongoose.model("WorkflowStage", workflowStageSchema);
const Workflow = mongoose.model("Workflow", workflowSchema);

module.exports = {
  WorkflowStage,
  Workflow,
};
