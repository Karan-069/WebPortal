import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schedulerMasterSchema = new Schema(
  {
    jobName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    jobType: {
      type: String,
      required: true,
      enum: ["SLA_PROCESSOR", "REMINDER", "AUTO_ACTION", "GENERAL"],
    },
    scheduleInterval: {
      type: String,
      required: true, // E.g., cron string '* * * * *' or interval notation
    },
    targetFunction: {
      type: String,
      required: true, // The internal service name/reference to execute
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastRunAt: {
      type: Date,
      default: null,
    },
    nextRunAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed, // Config variables (e.g., threshold hours)
    },
  },
  {
    timestamps: true,
  },
);

schedulerMasterSchema.plugin(mongoosePaginate);

export const SchedulerMaster = mongoose.model(
  "SchedulerMaster",
  schedulerMasterSchema,
);
export { schedulerMasterSchema };
