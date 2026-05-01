import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ApiError } from "../utils/ApiError.js";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";
import { auditPlugin } from "../utils/auditPlugin.js";

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
          enum: ["add", "edit", "view", "delete", "all"],
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
  },
);

userRoleSchema.plugin(auditPlugin);
userRoleSchema.plugin(mongoosePaginate);
userRoleSchema.plugin(autoCodePlugin, { moduleName: "userRole" });

userRoleSchema.methods.PopulateMenus = async function () {
  try {
    await this.populate({
      path: "menus.menuId",
      select:
        "menuId description parentMenu sortOrder icon menuLevel menuType permissions isActive",
    });
  } catch (error) {
    throw new ApiError(500, error?.message || "Error while Populating MenuIds");
  }
};

export const UserRole = mongoose.model("UserRole", userRoleSchema);
export { userRoleSchema };
