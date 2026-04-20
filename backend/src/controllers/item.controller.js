import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getItemsService,
  getItemByIdService,
  createItemService,
  updateItemService,
  submitItemService,
  toggleItemStatusService,
} from "../services/item.service.js";

const getItems = asyncHandler(async (req, res) => {
  const result = await getItemsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Items fetched successfully"));
});

const getItemById = asyncHandler(async (req, res) => {
  const item = await getItemByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, item, "Item fetched successfully"));
});

const createItem = asyncHandler(async (req, res) => {
  const item = await createItemService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, item, "Item created successfully"));
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await updateItemService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, item, "Item updated successfully"));
});

const submitItem = asyncHandler(async (req, res) => {
  const item = await submitItemService(req.params.id, req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, item, "Item submitted to workflow"));
});

const toggleItemStatus = asyncHandler(async (req, res) => {
  const result = await toggleItemStatusService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result.updatedRecord, result.successMessage));
});

export {
  getItems,
  getItemById,
  createItem,
  updateItem,
  submitItem,
  toggleItemStatus,
};
