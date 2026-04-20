import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const workflowLogSchema = new Schema(
  {
    transactionModel: {
      type: String,
      required: true,
      enum: [
        "Bill",
        "Vendor",
        "Location",
        "Item",
        "Department",
        "Subsidary",
        "User",
        "City",
        "State",
      ],
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "transactionModel",
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
      enum: [
        "submit",
        "approve",
        "reject",
        "delegate",
        "clarification_requested",
        "clarification_provided",
        "auto_notify",
      ],
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
  },
);

workflowLogSchema.plugin(mongoosePaginate);

export const WorkflowLog = mongoose.model("WorkflowLog", workflowLogSchema);
export { workflowLogSchema };
