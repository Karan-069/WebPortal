import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import mongoosePaginate from "mongoose-paginate-v2";

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
    userRole: {
      type: Schema.Types.ObjectId,
      ref: "UserRole",
      required: [true, "User Role is Mandatory!!"],
    },
    workflowRole: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowRole",
      required: [true, "Workflow Role is Mandatory!!"],
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
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified) return next();

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
      userRole: this.userRole,
      workflowRole: this.workflowRole,
      accessType: this.accessType,
    },
    process.env.JWT_ACCESS_SECRET_KEY,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY,
    }
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
    }
  );
};

UserSchema.plugin(mongoosePaginate);

export const User = mongoose.model("User", UserSchema);
