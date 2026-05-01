import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const auditLogSchema = new Schema(
  {
    collectionName: {
      type: String,
      required: true,
      index: true,
    },
    recordId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE"],
    },
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        oldDisplayValue: String, // Resolves IDs to Names
        newDisplayValue: String,
        isLineItem: { type: Boolean, default: false },
      },
    ],
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.plugin(mongoosePaginate);

export { auditLogSchema };
