import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { auditPlugin } from "../utils/auditPlugin.js";
import { autoCodePlugin } from "../utils/autoCodePlugin.js";

const chartOfAccountsSchema = new Schema(
  {
    accountCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["Asset", "Liability", "Equity", "Revenue", "Expense"],
      required: true,
    },
    accountGroup: {
      type: String,
      trim: true,
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

chartOfAccountsSchema.plugin(mongoosePaginate);
chartOfAccountsSchema.plugin(auditPlugin);
chartOfAccountsSchema.plugin(autoCodePlugin, { moduleName: "chartOfAccounts" });

export const ChartOfAccounts = mongoose.model(
  "ChartOfAccounts",
  chartOfAccountsSchema,
);
export { chartOfAccountsSchema };
