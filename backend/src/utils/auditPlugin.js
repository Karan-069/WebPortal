import { useModels, useUserId } from "./tenantContext.js";
import mongoose from "mongoose";

const getDisplayValue = async (models, refModelName, id) => {
  if (!id || !refModelName || !models) return null;
  let targetModelName =
    typeof refModelName === "function" ? refModelName() : refModelName;

  if (!models[targetModelName]) {
    // Attempt case-insensitive match if direct match fails
    const actualModelName = Object.keys(models).find(
      (k) => k.toLowerCase() === targetModelName.toLowerCase(),
    );
    if (!actualModelName) {
      console.warn(
        `[AuditPlugin] Model "${targetModelName}" not found in tenant models.`,
      );
      return id.toString();
    }
    targetModelName = actualModelName;
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return String(id);
    }

    const doc = await models[targetModelName].findById(id).lean();
    if (!doc) return id.toString();

    // Names and Descriptions are preferred, but specific codes are more reliable for certain models
    const label =
      doc.accountName ||
      doc.accountCode ||
      doc.lobCode ||
      doc.description ||
      doc.fullName ||
      doc.roleName ||
      doc.name ||
      doc.shName ||
      doc.itemCode ||
      doc.deptCode ||
      doc.uomCode ||
      doc.code ||
      doc.label ||
      doc.title ||
      doc.wfRoleCode ||
      doc.roleCode ||
      doc.email;

    return label ? String(label) : id.toString();
  } catch (err) {
    console.warn(
      `[AuditPlugin] Failed to resolve ${modelName} ID ${id}:`,
      err.message,
    );
    return String(id);
  }
};

const flattenValue = (val) => {
  if (
    val === null ||
    val === undefined ||
    val === "" ||
    (Array.isArray(val) && val.length === 0)
  )
    return null;
  if (val instanceof mongoose.Types.Decimal128)
    return parseFloat(val.toString());
  if (val instanceof Date) return val.toISOString();
  if (mongoose.Types.ObjectId.isValid(val)) return val.toString();
  if (typeof val === "object") return JSON.stringify(val);
  return val;
};

const compareValues = (oldVal, newVal) => {
  const v1 = flattenValue(oldVal);
  const v2 = flattenValue(newVal);
  if (v1 === null && v2 === null) return true;
  return v1 === v2;
};

/**
 * Mongoose plugin to automatically track changes (diffs) and system metadata
 */
export const auditPlugin = (schema) => {
  schema.add({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  });

  const getCollectionName = (doc, query) => {
    let name = "";
    if (doc && doc.constructor && doc.constructor.modelName)
      name = doc.constructor.modelName;
    else if (doc && doc.modelName) name = doc.modelName;
    else if (query && query.model && query.model.modelName)
      name = query.model.modelName;
    else if (schema.options.collection) name = schema.options.collection;
    return (name || "unknown").toLowerCase();
  };

  const getRefModelForPath = (path) => {
    // 1. Clean the path of array indices and context tags
    const strippedPath = path
      .replace(/\[\d+\]/g, "")
      .replace(/\s\[.*?\]/g, "")
      .trim();

    // 2. Try direct lookup
    let schemaType = schema.path(strippedPath);

    // 3. If found, check options
    if (schemaType) {
      // Direct ref
      if (schemaType.options?.ref) return schemaType.options.ref;

      // Array of refs: check internal caster options
      if (schemaType.caster?.options?.ref) return schemaType.caster.options.ref;

      // Alternative array ref check
      if (
        schemaType.options?.type &&
        Array.isArray(schemaType.options.type) &&
        schemaType.options.type[0]?.ref
      ) {
        return schemaType.options.type[0].ref;
      }
    }

    // 4. Fallback: try to find ref in parent if it's a deep path
    const parts = strippedPath.split(".");
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join(".");
      const parentType = schema.path(parentPath);
      if (parentType?.options?.ref) return parentType.options.ref;
    }

    return null;
  };

  const processChange = async (
    models,
    field,
    oldVal,
    newVal,
    isLineItem = false,
  ) => {
    // Noise filtering: if logically identical, skip
    if (compareValues(oldVal, newVal)) return null;

    const change = { field, oldValue: oldVal, newValue: newVal, isLineItem };
    const refModelName = getRefModelForPath(field);

    if (refModelName) {
      if (oldVal && mongoose.Types.ObjectId.isValid(oldVal)) {
        change.oldDisplayValue = await getDisplayValue(
          models,
          refModelName,
          oldVal,
        );
      }
      if (newVal && mongoose.Types.ObjectId.isValid(newVal)) {
        change.newDisplayValue = await getDisplayValue(
          models,
          refModelName,
          newVal,
        );
      }
    }

    // Fallback to flattened values for display
    if (!change.oldDisplayValue && oldVal !== null && oldVal !== undefined) {
      const flat = flattenValue(oldVal);
      change.oldDisplayValue = flat === null ? "None" : String(flat);
    }
    if (!change.newDisplayValue && newVal !== null && newVal !== undefined) {
      const flat = flattenValue(newVal);
      change.newDisplayValue = flat === null ? "None" : String(flat);
    }

    // Ensure we don't return a change where both displays are logically "None"
    if (change.oldDisplayValue === "None" && change.newDisplayValue === "None")
      return null;

    return change;
  };

  const getContextForArrayItem = async (models, parentKey, item) => {
    if (!item || typeof item !== "object") return null;

    // Look for common identity fields
    const idFields = [
      "fieldName",
      "stageName",
      "roleName",
      "name",
      "description",
      "label",
      "menuId",
      "stageApproverRole",
    ];
    for (const f of idFields) {
      if (item[f]) {
        const val = item[f];
        // If it's a reference, resolve it
        const refModel = getRefModelForPath(`${parentKey}.${f}`);
        if (refModel) return await getDisplayValue(models, refModel, val);
        return String(val);
      }
    }
    return null;
  };

  const getGranularChanges = async (
    models,
    oldDoc,
    newDoc,
    parentKey = "",
    isLineItem = false,
  ) => {
    const changes = [];
    const keys = new Set([
      ...Object.keys(oldDoc || {}),
      ...Object.keys(newDoc || {}),
    ]);

    for (const key of keys) {
      if (
        [
          "updatedAt",
          "updatedBy",
          "__v",
          "password",
          "createdBy",
          "createdAt",
          "_id",
        ].includes(key)
      )
        continue;

      const fullPath = parentKey ? `${parentKey}.${key}` : key;
      const oldVal = oldDoc ? oldDoc[key] : undefined;
      const newVal = newDoc ? newDoc[key] : undefined;

      if (compareValues(oldVal, newVal)) continue;

      const isArray = Array.isArray(newVal) || Array.isArray(oldVal);
      const isRealObj = (val) =>
        val !== null &&
        typeof val === "object" &&
        !(val instanceof mongoose.Types.ObjectId) &&
        !(val instanceof Date);

      if (isArray) {
        const arrOld = Array.isArray(oldVal) ? oldVal : [];
        const arrNew = Array.isArray(newVal) ? newVal : [];
        const maxLen = Math.max(arrOld.length, arrNew.length);

        for (let i = 0; i < maxLen; i++) {
          const itemOld = arrOld[i];
          const itemNew = arrNew[i];

          if (!compareValues(itemOld, itemNew)) {
            const context = await getContextForArrayItem(
              models,
              fullPath,
              itemNew || itemOld,
            );
            const contextTag = context ? ` [${context}]` : "";
            const itemPath = `${fullPath}${contextTag}[${i}]`;

            if (isRealObj(itemOld) || isRealObj(itemNew)) {
              const subChanges = await getGranularChanges(
                models,
                isRealObj(itemOld) ? itemOld : {},
                isRealObj(itemNew) ? itemNew : {},
                itemPath,
                true,
              );
              changes.push(...subChanges);
            } else {
              const chg = await processChange(
                models,
                itemPath,
                itemOld,
                itemNew,
                true,
              );
              if (chg) changes.push(chg);
            }
          }
        }
      } else if (isRealObj(oldVal) || isRealObj(newVal)) {
        // Nested Object (not array)
        const subChanges = await getGranularChanges(
          models,
          isRealObj(oldVal) ? oldVal : {},
          isRealObj(newVal) ? newVal : {},
          fullPath,
          isLineItem,
        );
        changes.push(...subChanges);
      } else {
        // Scalar value
        const chg = await processChange(
          models,
          fullPath,
          oldVal,
          newVal,
          isLineItem,
        );
        if (chg) changes.push(chg);
      }
    }
    return changes;
  };

  // PRE-SAVE Hook
  schema.pre("save", async function (next) {
    try {
      const userId = useUserId();
      if (!userId) return next();

      if (this.isNew) {
        this.createdBy = userId;
        this.updatedBy = userId;
        this._auditAction = "CREATE";
      } else {
        this.updatedBy = userId;
        this._auditAction = "UPDATE";
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  // POST-SAVE Hook
  schema.post("save", async function (doc) {
    try {
      const userId = useUserId();
      // Robust model access: fallback to doc's connection if context is lost
      const contextModels = useModels();
      const models =
        contextModels && Object.keys(contextModels).length > 0
          ? contextModels
          : doc.constructor?.db?.models;

      if (!userId || !models || !models.AuditLog || !doc._auditAction) return;

      const collectionName = getCollectionName(doc);
      const oldDoc = doc._auditAction === "CREATE" ? null : doc._original;
      const newDoc = doc.toObject();

      const changes = await getGranularChanges(models, oldDoc, newDoc);

      if (changes.length > 0) {
        await models.AuditLog.create({
          collectionName,
          recordId: doc._id,
          action: doc._auditAction,
          changes,
          performedBy: userId,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      console.error("[AuditPlugin] Logging Error:", err);
    }
  });

  schema.post("init", function (doc) {
    doc._original = doc.toObject();
  });

  // Handle findOneAndUpdate hooks
  schema.pre("findOneAndUpdate", async function (next) {
    try {
      const userId = useUserId();
      if (!userId) return next();
      this.set({ updatedBy: userId });
      const docToUpdate = await this.model.findOne(this.getQuery()).lean();
      if (docToUpdate) this._oldDoc = docToUpdate;
      next();
    } catch (err) {
      next(err);
    }
  });

  schema.post("findOneAndUpdate", async function (doc) {
    try {
      const userId = useUserId();
      const contextModels = useModels();
      // Ensure we have a valid models object with AuditLog; fallback if context is empty
      const models =
        contextModels && Object.keys(contextModels).length > 0
          ? contextModels
          : this.model?.db?.models;

      if (!userId || !models || !models.AuditLog || !doc) return;

      const collectionName = getCollectionName(doc, this);
      const oldDoc = this._oldDoc;
      // Use a fresh lean fetch for newDoc to avoid comparing against populated objects
      const rawNewDoc = await models[
        doc.constructor.modelName || collectionName
      ]
        .findById(doc._id)
        .lean();
      const newDoc = rawNewDoc || (doc.toObject ? doc.toObject() : doc);

      const changes = await getGranularChanges(models, oldDoc, newDoc);

      if (changes.length > 0) {
        await models.AuditLog.create({
          collectionName,
          recordId: doc._id,
          action: "UPDATE",
          changes,
          performedBy: userId,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      console.error("[AuditPlugin] Update Logging Error:", err);
    }
  });
};
