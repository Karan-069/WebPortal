import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import mongoosePaginate from "mongoose-paginate-v2";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email ID is Mandatory!!"],
      lowercase: true,
      index: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is Mandatory"],
    },
    fullName: {
      type: String,
      required: true,
    },
    userRoles: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserRole",
        required: [true, "At least one User Role is Mandatory!!"],
      },
    ],
    workflowRoles: [
      {
        type: Schema.Types.ObjectId,
        ref: "WorkflowRole",
        required: [true, "At least one Workflow Role is Mandatory!!"],
      },
    ],
    roleAssignments: [
      {
        userRole: { type: Schema.Types.ObjectId, ref: "UserRole" },
        workflowRole: { type: Schema.Types.ObjectId, ref: "WorkflowRole" },
      },
    ],
    defaultRoleAssignment: {
      userRole: { type: Schema.Types.ObjectId, ref: "UserRole" },
      workflowRole: { type: Schema.Types.ObjectId, ref: "WorkflowRole" },
    },
    activeRole: {
      type: Schema.Types.ObjectId,
      ref: "UserRole",
    },
    activeWorkflowRole: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowRole",
    },
    refreshToken: {
      type: String,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is Mandatory!!"],
    },
    accessType: {
      type: String,
      enum: ["user", "vendor"],
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      userRole: this.activeRole,
      workflowRole: this.activeWorkflowRole,
      accessType: this.accessType,
    },
    process.env.JWT_ACCESS_SECRET_KEY,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY,
    },
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.JWT_REFRESH_SECRET_KEY,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY,
    },
  );
};

import { auditPlugin } from "../utils/auditPlugin.js";
UserSchema.plugin(auditPlugin);
UserSchema.plugin(mongoosePaginate);

export const User = mongoose.model("User", UserSchema);
export { UserSchema };
