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

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return { _id: identifier };
  }

  // Fallback to case-insensitive lookup for business codes
  return { [codeField]: { $regex: `^${identifier}$`, $options: "i" } };
};
