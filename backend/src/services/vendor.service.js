import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { submitToWorkflow } from "./workflow.service.js";
import { getLookupQuery } from "../utils/lookupHelper.js";
import mongoose from "mongoose";
import { enrichWithWorkflowState } from "../utils/workflowHelper.js";

const getVendorsService = async (query = {}) => {
  const { Vendor } = useModels();
  const {
    page: requestedPage = 1,
    limit: requestedLimit = 10,
    search = "",
    sortBy,
    sortOrder,
  } = query;
  const pageNum = parseInt(requestedPage) > 0 ? parseInt(requestedPage) : 1;
  const limitNum = parseInt(requestedLimit) > 0 ? parseInt(requestedLimit) : 10;

  const filter = {};
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { vendorId: { $regex: search, $options: "i" } },
      { emailId: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const vendorsData = await Vendor.paginate(filter, {
    page: pageNum,
    limit: limitNum,
    sort: sort,
    populate: [
      { path: "city", select: "description" },
      { path: "state", select: "description" },
      { path: "subsidary", select: "description" },
      { path: "crterm", select: "description" },
    ],
  });

  const { docs, totalDocs, totalPages, page, limit } = vendorsData;
  const enrichedDocs = await enrichWithWorkflowState(docs, "Vendor");
  return { docs: enrichedDocs, totalDocs, totalPages, page, limit };
};

const getVendorByIdService = async (id) => {
  const { Vendor } = useModels();
  const query = getLookupQuery(id, "vendorId");

  const vendor = await Vendor.findOne(query)
    .populate("city")
    .populate("state")
    .populate("subsidary")
    .populate("crterm");

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return vendor;
};

const createVendorService = async (body) => {
  const { Vendor } = useModels();
  const { fullName, emailId, registrationType, crterm, currency } = body;
  if (!fullName || !emailId || !registrationType || !crterm || !currency) {
    throw new ApiError(
      400,
      "Full Name, Email, Registration Type, Credit Term and Currency are required",
    );
  }

  const existingVendor = await Vendor.findOne({ fullName });
  if (existingVendor) {
    throw new ApiError(409, "Vendor with this name already exists");
  }

  const vendor = await Vendor.create(body);
  return vendor;
};

const updateVendorService = async (id, body) => {
  const { Vendor } = useModels();
  const query = getLookupQuery(id, "vendorId");
  const updatedVendor = await Vendor.findOneAndUpdate(
    query,
    { $set: body },
    { new: true, runValidators: true },
  );

  if (!updatedVendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return updatedVendor;
};

const toggleVendorStatusService = async (id) => {
  const { Vendor } = useModels();
  const query = getLookupQuery(id, "vendorId");
  const vendor = await Vendor.findOne(query);
  if (!vendor) throw new ApiError(404, "Vendor not found");
  return await toggleStatus(Vendor, vendor._id);
};

const getMyVendorProfileService = async (userId) => {
  const { Vendor } = useModels();
  const vendor = await Vendor.findOne({ linkedUserId: userId });
  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found for this user.");
  }
  return vendor;
};

const submitVendorProfileService = async (userId, updates) => {
  const { Vendor } = useModels();

  const vendor = await Vendor.findOne({ linkedUserId: userId });
  if (!vendor) {
    throw new ApiError(404, "No vendor profile found for this user.");
  }

  if (
    vendor.workflowStatus === "Pending Approval" ||
    vendor.workflowStatus === "Approved"
  ) {
    throw new ApiError(
      400,
      `Vendor profile is already ${vendor.workflowStatus}.`,
    );
  }

  const safeUpdates = { ...updates };
  delete safeUpdates.linkedUserId;
  delete safeUpdates.workflowStatus;
  delete safeUpdates.vendorId;

  Object.assign(vendor, safeUpdates);
  vendor.workflowStatus = "Pending Approval";
  vendor.registrationType = updates.registrationType || "regular";
  await vendor.save();

  try {
    const workflowResult = await submitToWorkflow(
      vendor._id,
      "Vendor",
      0,
      userId,
      null,
    );
    return { vendor, workflowResult, workflowWarning: null };
  } catch (err) {
    return { vendor, workflowResult: null, workflowWarning: err.message };
  }
};

export {
  getVendorsService,
  getVendorByIdService,
  createVendorService,
  updateVendorService,
  toggleVendorStatusService,
  getMyVendorProfileService,
  submitVendorProfileService,
};
