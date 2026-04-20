import mongoose from "mongoose";

/**
 * Generates a Mongoose query object that supports both MongoDB IDs
 * and fallback to a business code field.
 *
 * @param {string} identifier - The ID or Code to look up
 * @param {string} codeField - The name of the business code field (e.g., 'uomCode')
 * @returns {object} - The query object { _id: ... } or { [codeField]: ... }
 */
export const getLookupQuery = (identifier, codeField) => {
  if (!identifier) return null;

  // Use _id if it's a valid ObjectId, otherwise fallback to the codeField
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return { _id: identifier };
  }

  return { [codeField]: identifier };
};
