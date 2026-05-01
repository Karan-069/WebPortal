import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createBillService,
  getBillsService,
  getBillByIdService,
  updateBillService,
  submitBillService,
  workflowActionService,
  getWorkflowHistoryService,
} from "../services/bill.service.js";

const createBill = asyncHandler(async (req, res) => {
  const bill = await createBillService(req.user._id, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, bill, "Bill created successfully"));
});

const getBills = asyncHandler(async (req, res) => {
  const result = await getBillsService(req.query, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Bills fetched successfully"));
});

const getBillById = asyncHandler(async (req, res) => {
  const bill = await getBillByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, bill, "Bill fetched successfully"));
});

const updateBill = asyncHandler(async (req, res) => {
  const bill = await updateBillService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, bill, "Bill updated successfully"));
});

const submitBill = asyncHandler(async (req, res) => {
  const bill = await submitBillService(req.params.id, req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, bill, "Bill submitted to workflow"));
});

const workflowAction = asyncHandler(async (req, res) => {
  const { action, comments, delegatedToUserId } = req.body;
  const bill = await workflowActionService(
    req.params.id,
    req.user._id,
    action,
    { comments, delegatedToUserId },
  );
  return res
    .status(200)
    .json(new ApiResponse(200, bill, "Workflow action processed successfully"));
});

const getBillHistory = asyncHandler(async (req, res) => {
  const history = await getWorkflowHistoryService(req.params.id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, history, "Workflow history fetched successfully"),
    );
});

export {
  createBill,
  getBills,
  getBillById,
  updateBill,
  submitBill,
  workflowAction,
  getBillHistory,
};
