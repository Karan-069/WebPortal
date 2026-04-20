import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    apiEndpoint: { type: String, required: true },
    clickRoute: { type: String, required: true },
    icon: { type: String, required: true },
    colorClass: { type: String, default: "text-slate-600" },
    bgClass: { type: String, default: "bg-slate-50" },
    order: { type: Number, default: 0 },
    desc: { type: String, default: "" },
  },
  { _id: false },
);

const dashboardConfigSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
      enum: ["vendor", "admin", "approver", "user", "default"],
    },
    layout: [cardSchema],
  },
  { timestamps: true },
);

export default mongoose.model("DashboardConfig", dashboardConfigSchema);
