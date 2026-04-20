import { useModels, useUserId } from "./tenantContext.js";
import mongoose from "mongoose";

const getDisplayValue = async (models, refModelName, id) => {
  if (!id || !refModelName || !models[refModelName]) return null;
  // Handle case where ref might be a function
  const modelName =
    typeof refModelName === "function" ? refModelName() : refModelName;

  try {
    const doc = await models[modelName].findById(id).lean();
    if (!doc) return id.toString();

    return (
      doc.description ||
      doc.shName ||
      doc.fullName ||
      doc.name ||
      doc.uomCode ||
      doc.deptCode ||
      doc.itemCode ||
      doc.title ||
      doc.code ||
      doc.label ||
      id.toString()
    );
  } catch (err) {
    console.warn(
      `[AuditPlugin] Failed to resolve ${modelName} ID ${id}:`,
      err.message,
    );
    return id.toString();
  }
};

/**
 * Mongoose plugin to automatically track changes (diffs) and system metadata
 * (createdBy, updatedBy) for any model it's attached to.
 */
export const auditPlugin = (schema) => {
  // Add metadata fields to the schema
  schema.add({
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  });

  // PRE-SAVE Hook for Create and Save updates
  schema.pre("save", async function (next) {
    try {
      const userId = useUserId();
      if (!userId) return next();

      if (this.isNew) {
        // Handle Creation
        this.createdBy = userId;
        this.updatedBy = userId;

        // Log Creation (Optional: track initial values)
        this._auditAction = "CREATE";
      } else {
        // Handle document.save() updates
        this.updatedBy = userId;
        this._auditAction = "UPDATE";

        // Calculate diff
        const changes = [];
        const modifiedPaths = this.modifiedPaths();

        for (const path of modifiedPaths) {
          if (["updatedAt", "updatedBy", "__v", "password"].includes(path))
            continue;

          changes.push({
            field: path,
            oldValue: this._original ? this._original[path] : undefined,
            newValue: this[path],
          });
        }
        this._auditChanges = changes;
      }
      next();
    } catch (err) {
      next(err);
    }
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

  schema.post("save", async function (doc) {
    try {
      const userId = useUserId();
      const models = useModels();
      if (!userId || !models || !models.AuditLog || !doc._auditAction) return;

      const collectionName = getCollectionName(doc);
      let changes = doc._auditChanges || [];

      if (doc._auditAction === "CREATE") {
        const obj = doc.toObject();
        Object.keys(obj).forEach((key) => {
          if (
            [
              "_id",
              "__v",
              "createdAt",
              "updatedAt",
              "password",
              "createdBy",
              "updatedBy",
            ].includes(key)
          )
            return;
          changes.push({ field: key, oldValue: null, newValue: obj[key] });
        });
      }

      if (changes.length > 0) {
        for (const change of changes) {
          const schemaType = schema.path(change.field);
          if (schemaType?.options?.ref) {
            const refModelName = schemaType.options.ref;
            if (change.oldValue)
              change.oldDisplayValue = await getDisplayValue(
                models,
                refModelName,
                change.oldValue,
              );
            if (change.newValue)
              change.newDisplayValue = await getDisplayValue(
                models,
                refModelName,
                change.newValue,
              );
          }
        }

        await models.AuditLog.create({
          collectionName,
          recordId: doc._id,
          action: doc._auditAction,
          changes,
          performedBy: userId,
          timestamp: new Date(),
        });
        console.log(
          `[AuditPlugin] Saved AuditLog for ${collectionName}:${doc._id} (${doc._auditAction})`,
        );
      }
    } catch (err) {
      console.error("[AuditPlugin] Logging Error:", err);
    }
  });

  // Init hook remains the same
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
      const models = useModels();
      if (!userId || !models || !models.AuditLog || !doc) return;

      const collectionName = getCollectionName(doc, this);
      const oldDoc = this._oldDoc;
      const newDoc = doc.toObject ? doc.toObject() : doc;
      const changes = [];

      Object.keys(newDoc).forEach((key) => {
        if (
          ["updatedAt", "updatedBy", "__v", "password", "createdBy"].includes(
            key,
          )
        )
          return;
        const oldVal = oldDoc ? JSON.stringify(oldDoc[key]) : undefined;
        const newVal = JSON.stringify(newDoc[key]);

        if (oldVal !== newVal) {
          changes.push({
            field: key,
            oldValue: oldDoc ? oldDoc[key] : null,
            newValue: newDoc[key],
          });
        }
      });

      if (changes.length > 0) {
        for (const change of changes) {
          const schemaType = schema.path(change.field);
          if (schemaType?.options?.ref) {
            const refModelName = schemaType.options.ref;
            if (change.oldValue)
              change.oldDisplayValue = await getDisplayValue(
                models,
                refModelName,
                change.oldValue,
              );
            if (change.newValue)
              change.newDisplayValue = await getDisplayValue(
                models,
                refModelName,
                change.newValue,
              );
          }
        }

        await models.AuditLog.create({
          collectionName,
          recordId: doc._id,
          action: "UPDATE",
          changes,
          performedBy: userId,
          timestamp: new Date(),
        });
        console.log(
          `[AuditPlugin] Saved AuditLog for ${collectionName}:${doc._id} (UPDATE)`,
        );
      }
    } catch (err) {
      console.error("[AuditPlugin] Update Logging Error:", err);
    }
  });
};
