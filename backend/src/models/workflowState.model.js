import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const workflowStateSchema = new Schema(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "transactionModel",
      index: true,
    },
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
        "UserRole",
      ],
    },
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    currentStageNumber: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "rejected",
        "clarification_requested",
        "recalled",
      ],
      default: "pending",
    },
    delegatedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    transactionAmount: {
      type: mongoose.Types.Decimal128,
      default: 0,
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

workflowStateSchema.plugin(mongoosePaginate);

// Compound index to quickly find a transaction's current state
workflowStateSchema.index(
  { transactionId: 1, transactionModel: 1 },
  { unique: true },
);

export const WorkflowState = mongoose.model(
  "WorkflowState",
  workflowStateSchema,
);
export { workflowStateSchema };
