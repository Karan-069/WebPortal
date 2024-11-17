import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ApiError } from "../utils/ApiError.js";

const userRoleSchema = new Schema(
  {
    roleCode: {
      type: String,
      required: [true, "Role Code is Mandatory!!"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is Mandatory!!"],
    },
    menus: [
      {
        menuId: {
          type: Schema.Types.ObjectId,
          ref: "AppMenu",
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

userRoleSchema.methods.PopulateMenus = async function () {
  try {
    await this.populate({ path: "menus.menuId", select: "menuId description" });
  } catch (error) {
    throw new ApiError(500, error?.message || "Error while Populating MenuIds");
  }
};

export const UserRole = mongoose.model("UserRole", userRoleSchema);
