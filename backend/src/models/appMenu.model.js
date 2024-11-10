import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const appMenuSchema = new Schema(
  {
    menuId: {
      type: String,
      required: [true, "Menu Id is Mandatory!!"],
    },
    description: {
      type: String,
      unique: true,
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
  }
);

appMenuSchema.plugin(mongoosePaginate);

export const AppMenu = mongoose.model("AppMenu", appMenuSchema);
