import { ApiError } from "./ApiError.js";

const softDeleteRecord = async (model, id) => {
  try {
    const record = await model.findById(id);

    if (!record) {
      throw new ApiError(400, "Record Does not Exists!!");
    }

    record.isActive = false;

    await record.save();

    return record;
  } catch (error) {
    throw new ApiError(500, error?.message || "Error Making record InActive!!");
  }
};

export { softDeleteRecord };
