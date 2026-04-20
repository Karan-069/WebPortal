import mongoose from "mongoose";
import { useModels } from "../utils/tenantContext.js";

/**
 * Utility to normalize all AuditLog collectionNames to lowercase.
 * This ensures that logs created before the lowercase standardization
 * are still visible in the UI.
 */
export const migrateAuditLogCasing = async () => {
  const { AuditLog } = useModels();
  if (!AuditLog) return;

  try {
    const logs = await AuditLog.find({ collectionName: { $regex: /[A-Z]/ } });
    console.log(
      `[Migration] Found ${logs.length} AuditLogs with uppercase characters.`,
    );

    for (const log of logs) {
      log.collectionName = log.collectionName.toLowerCase();
      await log.save();
    }

    if (logs.length > 0) {
      console.log(
        `[Migration] Successfully normalized ${logs.length} logs to lowercase.`,
      );
    }
  } catch (err) {
    console.error(`[Migration] AuditLog normalization failed:`, err);
  }
};
