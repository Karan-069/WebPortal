import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const emailLogSchema = new Schema(
  {
    eventName: {
      type: String,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    errorMessage: {
      type: String,
    },
    transactionId: {
      type: String, // Optional reference to a bill/item/etc
      index: true,
    },
    transactionModel: {
      type: String,
    },
    cc: [String],
    bcc: [String],
  },
  {
    timestamps: true,
  },
);

emailLogSchema.plugin(mongoosePaginate);

export const EmailLog = mongoose.model("EmailLog", emailLogSchema);
export { emailLogSchema };
