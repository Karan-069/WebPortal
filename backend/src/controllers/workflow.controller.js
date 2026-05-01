import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  submitToWorkflow,
  processWorkflowAction,
  bulkProcessActionsBackground,
  getAllWorkflowsService,
  getWorkflowByIdService,
  createWorkflowService,
  updateWorkflowService,
  toggleWorkflowStatusService,
  amendWorkflowService,
  getWorkflowStateService,
  recallWorkflowService,
  addAdHocApproverService,
} from "../services/workflow.service.js";

const initiateWorkflow = asyncHandler(async (req, res) => {
  const { transactionId, transactionModel, amount, moduleContext } = req.body;
  const workflowResult = await submitToWorkflow(
    transactionId,
    transactionModel,
    amount,
    req.user._id,
    moduleContext,
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, workflowResult, "Workflow initiated successfully"),
    );
});

const amendWorkflow = asyncHandler(async (req, res) => {
  const { transactionId, transactionModel } = req.body;
  const workflowResult = await amendWorkflowService(
    transactionId,
    transactionModel,
    req.user._id,
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        workflowResult,
        "Transaction amended and workflow reset successfully",
      ),
    );
});

const recallWorkflow = asyncHandler(async (req, res) => {
  const { transactionId, transactionModel } = req.body;
  const workflowResult = await recallWorkflowService(
    transactionId,
    transactionModel,
    req.user._id,
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, workflowResult, "Transaction recalled successfully"),
    );
});

const addAdHocApprover = asyncHandler(async (req, res) => {
  const { transactionId, transactionModel, approverId } = req.body;
  const workflowResult = await addAdHocApproverService(
    transactionId,
    transactionModel,
    approverId,
    req.user._id,
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        workflowResult,
        "Ad-Hoc Approver added successfully",
      ),
    );
});

const processAction = asyncHandler(async (req, res) => {
  const { transactionId, transactionModel, action, ...payload } = req.body;
  const workflowResult = await processWorkflowAction(
    transactionId,
    transactionModel,
    req.user._id,
    action,
    payload,
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        workflowResult,
        "Workflow action processed successfully",
      ),
    );
});

const bulkProcessActions = asyncHandler(async (req, res) => {
  // Bulk processing is usually long-running, so we trigger a background job
  // for multiple transactions.
  bulkProcessActionsBackground(req.body, req.user._id);

  return res
    .status(202)
    .json(
      new ApiResponse(
        202,
        null,
        "Bulk processing started in background. You will be notified once complete.",
      ),
    );
});

/**
 * Administrative CRUDS for Workflow Definitions
 */
const getAllWorkflows = asyncHandler(async (req, res) => {
  const result = await getAllWorkflowsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Workflows fetched successfully"));
});

const getWorkflowById = asyncHandler(async (req, res) => {
  const workflow = await getWorkflowByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, workflow, "Workflow fetched successfully"));
});

const createWorkflow = asyncHandler(async (req, res) => {
  const workflow = await createWorkflowService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, workflow, "Workflow created successfully"));
});

const updateWorkflow = asyncHandler(async (req, res) => {
  const workflow = await updateWorkflowService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, workflow, "Workflow updated successfully"));
});

const toggleWorkflowStatus = asyncHandler(async (req, res) => {
  const result = await toggleWorkflowStatusService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result.updatedRecord, result.successMessage));
});

const getWorkflowState = asyncHandler(async (req, res) => {
  const { transactionId, transactionModel } = req.query;
  const result = await getWorkflowStateService(
    transactionId,
    transactionModel,
    req.user._id,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Workflow state fetched successfully"));
});

export {
  initiateWorkflow,
  amendWorkflow,
  processAction,
  bulkProcessActions,
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  toggleWorkflowStatus,
  getWorkflowState,
  recallWorkflow,
  addAdHocApprover,
};
