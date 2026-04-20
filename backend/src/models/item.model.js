import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

const itemSchema = new Schema(
  {
    itemCode: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is Mandatory!!"],
      unique: true,
    },
    shName: {
      type: String,
      required: [true, "Short Name is Mandatory!!"],
    },
    itemCategory: {
      type: String,
    },
    gstRate: {
      type: Number,
      required: [true, "GST Rate is Mandatory!!"],
    },
    hsnCode: {
      type: String,
      required: [true, "HSN Code is Mandatory!!"],
    },
    itemType: {
      type: String,
      enum: ["capitalGoods", "services", "goods"],
      required: true,
      index: true,
    },
    inventoryType: {
      type: String,
      enum: [
        "Lot Numbered Inventory",
        "Inventory",
        "Service for Purchase",
        "Service for Sale",
        "Non-Inventory for Purchase",
        "Non-Inventory for Sale",
        "Assembly",
        "Lot Numbered Assembly",
      ],
      index: true,
    },
    // ... rest of the fields remains the same

    // Units of Measure
    baseUnit: { type: Schema.Types.ObjectId, ref: "Uom" },
    saleUnit: { type: Schema.Types.ObjectId, ref: "Uom" },
    purchaseUnit: { type: Schema.Types.ObjectId, ref: "Uom" },
    consumptionUnit: { type: Schema.Types.ObjectId, ref: "Uom" },

    // Pricing & Business Logic
    pricingModel: {
      type: String,
      enum: ["FIFO", "LIFO", "Average", "Standard", "COCO", "FOFO"],
    },
    lineOfBusiness: { type: Schema.Types.ObjectId, ref: "LineOfBusiness" },
    canBeFulfilled: { type: Boolean, default: true },
    nonInvCoco: { type: Boolean, default: false },
    saleToCoco: { type: Boolean, default: false },
    saleToFofo: { type: Boolean, default: false },

    // Accounting Accounts
    incomeAccount: { type: Schema.Types.ObjectId, ref: "ChartOfAccounts" },
    expenseAccount: { type: Schema.Types.ObjectId, ref: "ChartOfAccounts" },
    assetAccount: { type: Schema.Types.ObjectId, ref: "ChartOfAccounts" },
    cogsAccount: { type: Schema.Types.ObjectId, ref: "ChartOfAccounts" },
    gainLossAccount: { type: Schema.Types.ObjectId, ref: "ChartOfAccounts" },
    priceVarianceAccount: {
      type: Schema.Types.ObjectId,
      ref: "ChartOfAccounts",
    },
    quantityVarianceAccount: {
      type: Schema.Types.ObjectId,
      ref: "ChartOfAccounts",
    },
    vendorReturnAccount: {
      type: Schema.Types.ObjectId,
      ref: "ChartOfAccounts",
    },
    customerReturnAccount: {
      type: Schema.Types.ObjectId,
      ref: "ChartOfAccounts",
    },
    pricePurchaseVarianceAccount: {
      type: Schema.Types.ObjectId,
      ref: "ChartOfAccounts",
    },

    // Operational Fields
    useBins: { type: Boolean, default: false },
    purchaseLeadTime: { type: Number, default: 0 },
    safetyStockLevel: { type: Number, default: 0 },

    isActive: {
      type: Boolean,
      default: true,
    },
    transactionStatus: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Universal Auto-Code Generation replaces custom logic below
itemSchema.plugin(autoCodePlugin, { moduleName: "item" });

import { auditPlugin } from "../utils/auditPlugin.js";
itemSchema.plugin(auditPlugin);

itemSchema.plugin(mongoosePaginate);

export const Item = mongoose.model("Item", itemSchema);
export { itemSchema };
