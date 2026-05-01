import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userDelegationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    delegatedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "revoked"],
      default: "active",
    },
    reason: {
      type: String,
      maxLength: 500,
    },
  },
  {
    timestamps: true,
  },
);

userDelegationSchema.plugin(mongoosePaginate);

// Index to quickly find active delegations
userDelegationSchema.index({ userId: 1, status: 1, startDate: 1, endDate: 1 });

export const UserDelegation = mongoose.model(
  "UserDelegation",
  userDelegationSchema,
);
export { userDelegationSchema };
