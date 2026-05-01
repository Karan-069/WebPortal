import { License } from "../models/admin/license.model.js";
import { ApiError } from "../utils/ApiError.js";

import mongoose from "mongoose";

const getLicensesService = async (queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  const licenses = await License.find()
    .populate("clientId", "name slug")
    .sort({ createdAt: -1 });
  return { docs: licenses, totalDocs: licenses.length, totalPages: 1 };
};

const getLicenseByIdService = async (id) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id }
    : { licenseCode: id };
  const license = await License.findOne(query)
    .populate("clientId", "name slug")
    .populate("createdBy", "fullName email")
    .populate("updatedBy", "fullName email");
  if (!license) throw new ApiError(404, "License not found");
  return license;
};

const createLicenseService = async (data) => {
  return await License.create(data);
};

const updateLicenseService = async (id, data) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id }
    : { licenseCode: id };
  const license = await License.findOneAndUpdate(query, data, { new: true })
    .populate("clientId", "name slug")
    .populate("createdBy", "fullName email")
    .populate("updatedBy", "fullName email");
  if (!license) throw new ApiError(404, "License not found for update");
  return license;
};

const deleteLicenseService = async (id) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id }
    : { licenseCode: id };
  const license = await License.findOneAndDelete(query);
  if (!license) throw new ApiError(404, "License not found for deletion");
  return license;
};

export {
  getLicensesService,
  getLicenseByIdService,
  createLicenseService,
  updateLicenseService,
  deleteLicenseService,
};
