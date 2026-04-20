import mongoose, { Schema } from "mongoose";
import { auditPlugin } from "../utils/auditPlugin.js";
import mongoosePaginate from "mongoose-paginate-v2";

const itemDetailSchema = new Schema({
  itemCode: {
    type: Schema.Types.ObjectId,
    ref: "Item",
  },
  uom: {
    type: Schema.Types.ObjectId,
    ref: "Uom",
  },
  quantity: {
    type: Number,
    min: [0, "Quantity cannot be less than 0"],
  },
  rate: {
    type: mongoose.Types.Decimal128,
  },
  taxRate: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: mongoose.Types.Decimal128,
  },
  totalAmount: {
    type: mongoose.Types.Decimal128,
  },
  remarks: {
    type: String,
    maxLength: 150,
  },
});

const billSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    transactionStatus: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
      index: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor is Mandatory!!"],
      index: true,
    },
    subsidiary: {
      type: Schema.Types.ObjectId,
      ref: "Subsidary",
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invoiceDate: {
      type: Date,
      index: true,
    },
    invoiceType: {
      type: String,
    },
    invoiceClassification: {
      type: String,
      enum: ["opex", "capex"],
    },
    remarks: {
      type: String,
      maxLength: 200,
    },
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
    },
    workflowStatus: {
      type: String,
      enum: ["pending", "completed", "rejected", "clarification_requested"],
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    billTotalAmount: {
      type: mongoose.Types.Decimal128,
      default: 0,
    },
    attachmentUrl: {
      type: String,
    },
    itemDetails: [itemDetailSchema],
  },
  {
    timestamps: true,
  },
);

billSchema.plugin(auditPlugin);
billSchema.plugin(mongoosePaginate);

// Auto-generate transactionId before save
billSchema.pre("save", async function (next) {
  if (this.isNew && !this.transactionId) {
    try {
      const NextTransactionId = this.constructor.db.model("NextTransactionId");
      const next_id = await NextTransactionId.findOneAndUpdate(
        { menuId: "bill" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true },
      );
      const prefix = next_id.prefix || "BILL";
      this.transactionId = `${prefix}-${String(next_id.sequenceValue).padStart(5, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export const Bill = mongoose.model("Bill", billSchema);
export { billSchema };
