import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userRoleSchema = new Schema(
  {
    roleCode: {
      type: String,
      required: [true, "Role Code is Mandatory!!"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is Mandatory!!"],
    },
    menus: [
      {
        menuId: {
          type: Schema.Types.ObjectId,
          ref: "appMenu",
          required: [true, "Menu ID is Mandatory!!"],
        },
        permissions: {
          type: [String],
          enum: ["add", "edit", "approve", "view", "submit", "all"],
          required: [true, "Permissions are Mandatory!!"],
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userRoleSchema.plugin(mongoosePaginate);

export const UserRole = mongoose.model("UserRole", userRoleSchema);
