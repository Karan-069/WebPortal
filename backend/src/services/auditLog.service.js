import mongoose from "mongoose";
import { useModels } from "../utils/tenantContext.js";

/**
 * Get Audit Logs (Simple Logic Reverted)
 */
export const getAuditLogsService = async (query) => {
  const { AuditLog } = useModels();
  const { recordId, collectionName, page = 1, limit = 10 } = query;

  const filter = {};
  if (recordId) {
    if (mongoose.isValidObjectId(recordId)) {
      filter.recordId = new mongoose.Types.ObjectId(recordId);
    } else {
      filter.recordId = recordId;
    }
  }
  if (collectionName) {
    filter.collectionName = { $regex: new RegExp(`^${collectionName}$`, "i") };
  }

  const result = await AuditLog.paginate(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [{ path: "performedBy", select: "fullName email" }],
    sort: { timestamp: -1 },
    lean: true,
  });

  // Fallback for display values if missing
  return {
    ...result,
    docs: (result.docs || []).map((log) => ({
      ...log,
      changes: (log.changes || []).map((c) => ({
        ...c,
        oldDisplayValue:
          c.oldDisplayValue ||
          (c.oldValue !== null && c.oldValue !== undefined
            ? String(c.oldValue)
            : ""),
        newDisplayValue:
          c.newDisplayValue ||
          (c.newValue !== null && c.newValue !== undefined
            ? String(c.newValue)
            : ""),
      })),
    })),
  };
};

import { sequenceConfig } from "../config/sequenceConfig.js";

export const getAuditLogByIdService = async (id) => {
  const models = useModels();
  const { AuditLog } = models;
  const log = await AuditLog.findById(id)
    .populate("performedBy", "fullName email")
    .lean();
  if (!log) return null;

  // Resolve business code for the audited record
  let recordCode = log.recordId.toString();
  const collection = log.collectionName;
  const config = sequenceConfig[collection];

  // Find model by name (case-insensitive match)
  const modelKey = Object.keys(models).find(
    (k) => k.toLowerCase() === collection.toLowerCase(),
  );

  if (config && modelKey && models[modelKey]) {
    try {
      const record = await models[modelKey].findById(log.recordId).lean();
      if (record) {
        recordCode =
          record[config.field] ||
          record.fullName ||
          record.description ||
          recordCode;
      }
    } catch (err) {
      console.warn(
        `[AuditLog] Could not resolve code for ${collection} ID ${log.recordId}`,
      );
    }
  }

  return {
    ...log,
    recordCode,
    changes: (log.changes || []).map((c) => ({
      ...c,
      oldDisplayValue:
        c.oldDisplayValue ||
        (c.oldValue !== null && c.oldValue !== undefined
          ? String(c.oldValue)
          : ""),
      newDisplayValue:
        c.newDisplayValue ||
        (c.newValue !== null && c.newValue !== undefined
          ? String(c.newValue)
          : ""),
    })),
  };
};
