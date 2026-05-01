import mongoose from "mongoose";
import { useModels } from "./tenantContext.js";

/**
 * Universally syncs a workflow state change back to the underlying business model (Bill, Vendor, etc.)
 *
 * @param {String} modelName - The mongoose model name (e.g. "Bill", "Vendor")
 * @param {ObjectId} transactionId - The '_id' of the document.
 * @param {String} workflowStatus - The exact state to apply (e.g., 'pending', 'approved', 'rejected', 'clarification_requested')
 * @param {Object} options - Any mongoose transaction options, e.g. { session }
 */
export const syncTransactionStatus = async (
  modelName,
  transactionId,
  workflowStatus,
  options = {},
) => {
  try {
    const Model = useModels()[modelName];
    if (!Model) {
      throw new Error(`Model ${modelName} not found in tenant context.`);
    }

    // Depending on the model, it might use 'workflowStatus', or 'transactionStatus', or 'status'.
    // We assume the standardized field is 'workflowStatus' across all models plugged into the engine.
    // If 'rejected', you might also want to reset the core transactionStatus back to 'save' (draft).

    const { session, userId } = options;
    let updatePayload = {};

    // Standard statuses for workflow engine
    if (workflowStatus === "pending") {
      updatePayload.transactionStatus = "submitted";
    } else if (workflowStatus === "completed") {
      updatePayload.transactionStatus = "approved";
      if (userId) {
        updatePayload.approvedBy = userId;
        updatePayload.approvedDate = new Date();
      }
    } else if (workflowStatus === "rejected") {
      updatePayload.transactionStatus = "rejected";
    } else if (workflowStatus === "clarification_requested") {
      updatePayload.transactionStatus = "clarification_requested";
    }

    // Set stage name if provided (useful for list view badges)
    // Removed currentStageName storage on model as per user request
    // We will use joins or lookups to display current stage

    // Also update legacy workflowStatus field if it exists in the model
    if (Model.schema.path("workflowStatus")) {
      updatePayload.workflowStatus = workflowStatus;
    }

    const updatedDocument = await Model.findByIdAndUpdate(
      transactionId,
      { $set: updatePayload },
      { new: true, ...options },
    );

    if (!updatedDocument) {
      console.warn(
        `[syncTransactionStatus] Warning: Failed to sync ${modelName} ID ${transactionId}. Document might not exist or lacks standard status columns.`,
      );
    }

    return updatedDocument;
  } catch (error) {
    if (error.name === "MissingSchemaError") {
      console.error(
        `[syncTransactionStatus] Error: Unknown model '${modelName}' provided. Ensure the model has been registered before workflow synchronization.`,
      );
    } else {
      console.error(
        `[syncTransactionStatus] Unknown error applying state to ${modelName} ${transactionId}:`,
        error,
      );
    }
  }
};
