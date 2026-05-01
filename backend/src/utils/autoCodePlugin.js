import { useModels } from "./tenantContext.js";
import { sequenceConfig } from "../config/sequenceConfig.js";

/**
 * Universal Mongoose Plugin for Auto-Generating Business Codes.
 * It uses the 'NextTransactionId' model to maintain sequences per module.
 *
 * @param {Schema} schema - Mongoose Schema
 * @param {Object} options - { moduleName: string }
 */
export const autoCodePlugin = (schema, options) => {
  const { moduleName } = options;
  const config = sequenceConfig[moduleName];

  if (!config) {
    console.warn(
      `[autoCodePlugin] No sequence config found for module: ${moduleName}`,
    );
    return;
  }

  schema.pre("validate", async function (next) {
    // Only generate code if it's a new document and the field is empty
    if (
      this.isNew &&
      (!this[config.field] ||
        this[config.field] === "Auto-generated" ||
        this[config.field] === "")
    ) {
      let NextTransactionIdModel;

      try {
        const tenantModels = useModels();
        if (tenantModels && tenantModels.NextTransactionId) {
          NextTransactionIdModel = tenantModels.NextTransactionId;
        } else {
          NextTransactionIdModel =
            this.constructor.db.model("NextTransactionId");
        }

        // Determine dynamic menuId and prefix based on category if requested
        let sequenceKey = moduleName;
        let defaultPrefix = config.prefix;

        if (config.prefixField && this[config.prefixField]) {
          const dynamicValue = String(this[config.prefixField]);
          if (
            dynamicValue &&
            dynamicValue !== "undefined" &&
            dynamicValue !== "null"
          ) {
            sequenceKey = `${moduleName}-${dynamicValue}`;
            defaultPrefix = dynamicValue;
          }
        }

        // Find or create sequence entry
        const sequenceDoc = await NextTransactionIdModel.findOneAndUpdate(
          { menuId: sequenceKey },
          {
            $inc: { sequenceValue: 1 },
            $setOnInsert: { prefix: defaultPrefix },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        );

        // Format: PREFIX-0001
        const activePrefix = sequenceDoc.prefix || defaultPrefix || "ID";
        const paddedValue = sequenceDoc.sequenceValue
          .toString()
          .padStart(3, "0");
        this[config.field] = `${activePrefix}-${paddedValue}`.toUpperCase();
      } catch (error) {
        return next(error);
      }
    }
    next();
  });
};
