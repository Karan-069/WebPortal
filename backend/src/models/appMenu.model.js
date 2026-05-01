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
    slug: {
      type: String,
      trim: true,
      description:
        "The URL segment associated with this menu (e.g. 'items' for /api/v1/items)",
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
      enum: ["add", "edit", "submit", "approve", "view", "delete", "all"],
      required: true,
    },
    isLookup: {
      type: Boolean,
      default: false,
      description:
        "If true, this menu's data can be viewed (read-only) by any authenticated user for lookup/dropdown purposes.",
    },
    scope: {
      type: String,
      enum: ["admin", "tenant"],
      default: "tenant",
      index: true,
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
