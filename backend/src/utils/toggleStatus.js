import { ApiError } from "./ApiError.js";

/**
 * Soft-deletes or reactivates a record by toggling its `isActive` status.
 * @param {mongoose.Model} model - The Mongoose model of the record.
 * @param {string} id - The ID of the record to be updated.
 * @returns {Promise<Object>} - The updated record and a success message.
 */

const toggleStatus = async (model, id) => {
  try {
    // Fetch the record by its ID
    const record = await model.findById(id);

    if (!record) {
      throw new ApiError(400, "Record Does not Exist!!");
    }

    // Determine new status by toggling `isActive`
    const updatedStatus = !record.isActive;

    // Update the `isActive` status in the database
    const updatedRecord = await model.findByIdAndUpdate(
      id,
      { isActive: updatedStatus },
      { new: true }
    );

    // Return success message based on updated status
    const successMessage = updatedStatus
      ? "Document Reactivated Successfully!!"
      : "Document Deactivated Successfully!!";

    // Return updated document and success message
    return { updatedRecord, successMessage };
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "An error occurred while toggling the status."
    );
  }
};

export { toggleStatus };
