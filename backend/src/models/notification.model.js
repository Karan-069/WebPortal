import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "bulk_workflow_result"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metaData: {
      type: Schema.Types.Mixed, // Storing things like transaction lists or bulk run ids
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.plugin(mongoosePaginate);

export const Notification = mongoose.model("Notification", notificationSchema);
export { notificationSchema };
