import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const appMenuSchema = new Schema(
  {
    menuId: {
      type: String,
      required: [true, "Menu Id is Mandatory!!"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is Mandatory"],
    },
    parentMenu: {
      type: Schema.Types.ObjectId,
      ref: "AppMenu",
    },
    sortOrder: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
    },
    menuLevel: {
      type: Number,
      default: 0, // 0 = root, 1 = first sub-level, 2 = second sub-level
    },
    menuType: {
      type: String,
      enum: ["folder", "page"],
      default: "page", // 'folder' = parent container, 'page' = navigable
    },
    permissions: {
      type: [String],
      enum: ["add", "edit", "submit", "approve", "view", "all"],
      required: true,
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

appMenuSchema.plugin(mongoosePaginate);

export const AppMenu = mongoose.model("AppMenu", appMenuSchema);
export { appMenuSchema };
