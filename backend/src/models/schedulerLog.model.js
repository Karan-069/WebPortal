import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schedulerLogSchema = new Schema(
  {
    masterId: {
      type: Schema.Types.ObjectId,
      ref: "SchedulerMaster",
      required: true,
      index: true,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    errorMessage: {
      type: String,
    },
    durationMs: {
      type: Number,
    },
    recordsProcessed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

schedulerLogSchema.plugin(mongoosePaginate);

export const SchedulerLog = mongoose.model("SchedulerLog", schedulerLogSchema);
export { schedulerLogSchema };
