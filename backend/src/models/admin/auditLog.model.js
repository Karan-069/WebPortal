import mongoose from "mongoose";
import { auditLogSchema } from "../auditLog.model.js";

// Register AuditLog on the global/admin connection
export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
