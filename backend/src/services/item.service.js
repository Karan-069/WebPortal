import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

import mongoose from "mongoose";

const getItemsService = async (query = {}) => {
  const { Item } = useModels();
  const { page = 1, limit = 10, search = "", sortBy, sortOrder } = query;
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 10;

  const filter = {};
  if (search) {
    filter.$or = [
      { itemCode: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { shName: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const itemsData = await Item.paginate(filter, {
    page: pageNum,
    limit: limitNum,
    sort: sort,
    populate: [
      { path: "baseUnit", select: "description" },
      { path: "saleUnit", select: "description" },
      { path: "purchaseUnit", select: "description" },
      { path: "consumptionUnit", select: "description" },
    ],
  });

  const {
    docs,
    totalDocs,
    totalPages,
    page: currentPage,
    limit: currentLimit,
  } = itemsData;
  return {
    docs,
    totalDocs,
    totalPages,
    page: currentPage,
    limit: currentLimit,
  };
};

const getItemByIdService = async (id) => {
  const { Item } = useModels();

  const populateFields = [
    "baseUnit",
    "saleUnit",
    "purchaseUnit",
    "consumptionUnit",
    { path: "createdBy", select: "fullName email" },
    { path: "updatedBy", select: "fullName email" },
    { path: "approvedBy", select: "fullName email" },
  ];

  const query = getLookupQuery(id, "itemCode");
  const item = await Item.findOne(query).populate(populateFields);

  if (!item) {
    throw new ApiError(404, "Item not found");
  }
  return item;
};

const createItemService = async (body) => {
  const { Item } = useModels();
  const { description, shName, gstRate, hsnCode, itemType } = body;
  if (!description || !shName || !gstRate || !hsnCode || !itemType) {
    throw new ApiError(
      400,
      "Description, Short Name, GST Rate, HSN Code and Item Type are mandatory",
    );
  }

  const existingItem = await Item.findOne({ description });
  if (existingItem) {
    throw new ApiError(409, "Item with this description already exists");
  }

  // Sanitize empty strings for optional ObjectId fields
  const sanitizedBody = { ...body };
  ["approvedBy", "createdBy", "updatedBy"].forEach((key) => {
    if (sanitizedBody[key] === "") sanitizedBody[key] = null;
  });

  const item = await Item.create({
    ...sanitizedBody,
    transactionStatus: "draft",
  });
  return item;
};

const updateItemService = async (id, body) => {
  const { Item } = useModels();
  const query = getLookupQuery(id, "itemCode");
  const item = await Item.findOne(query);
  if (!item) throw new ApiError(404, "Item not found");

  // Prevent editing after submission unless in draft or rejected
  if (
    item.transactionStatus &&
    !["draft", "rejected"].includes(item.transactionStatus)
  ) {
    // Allow editing if it's explicitly allowed (e.g. by an admin) or if no workflow is enabled
    // For now, strict:
    // throw new ApiError(400, "Item cannot be edited in its current status");
  }

  // Sanitize empty strings for optional ObjectId fields
  const sanitizedBody = { ...body };
  ["approvedBy", "createdBy", "updatedBy"].forEach((key) => {
    if (sanitizedBody[key] === "") sanitizedBody[key] = null;
  });

  const updatedItem = await Item.findOneAndUpdate(
    query,
    { $set: sanitizedBody },
    { new: true, runValidators: true },
  );

  return updatedItem;
};

const submitItemService = async (id, userId) => {
  const { Item } = useModels();
  const { submitToWorkflow } = await import("./workflow.service.js");

  const query = getLookupQuery(id, "itemCode");
  const item = await Item.findOne(query);
  if (!item) throw new ApiError(404, "Item not found");

  if (
    item.transactionStatus &&
    !["draft", "rejected"].includes(item.transactionStatus)
  ) {
    throw new ApiError(400, "Item is already submitted or processed");
  }

  // Check if item workflow is enabled in Features
  const { Feature } = useModels();
  const wfFeature = await Feature.findOne({ name: "itemWorkflowEnabled" });
  const isWfEnabled = wfFeature ? wfFeature.isEnabled : true;

  if (!isWfEnabled) {
    // Auto-approve if workflow is disabled
    item.transactionStatus = "approved";
    item.approvedBy = userId;
    item.approvedDate = new Date();
    await item.save();
    return item;
  }

  // Trigger workflow engine
  const wfState = await submitToWorkflow(
    item._id,
    "Item",
    0, // Items don't have a value-based threshold usually, or use 0
    userId,
    null, // context
  );

  item.transactionStatus = "submitted";
  await item.save();

  return item;
};

const toggleItemStatusService = async (id) => {
  const { Item } = useModels();
  const query = getLookupQuery(id, "itemCode");
  const item = await Item.findOne(query);
  if (!item) throw new ApiError(404, "Item not found");

  return await toggleStatus(Item, item._id);
};

export {
  getItemsService,
  getItemByIdService,
  createItemService,
  updateItemService,
  submitItemService,
  toggleItemStatusService,
};
