import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const loginLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "UserRole",
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    browser: {
      type: String,
      trim: true,
    },
    os: {
      type: String,
      trim: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

loginLogSchema.plugin(mongoosePaginate);

export const LoginLog = mongoose.model("LoginLog", loginLogSchema);
export { loginLogSchema };
