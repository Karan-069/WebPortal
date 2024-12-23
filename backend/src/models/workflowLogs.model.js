import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const workflowLogSchema = new Schema(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
      index: true,
    },
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
    },
    StageNo: {
      type: Number,
      required: true,
      min: 1,
    },
    StageStatus: {
      type: String,
      enum: ["submit", "approve", "reject", "delegate"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    comments: {
      type: String,
      maxLength: 500,
    },
  },
  {
    timestamps: true,
  }
);

workflowLogSchema.plugin(mongoosePaginate);

export const WorkflowLog = mongoose.model("WorkflowLog", workflowLogSchema);
