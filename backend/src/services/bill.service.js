import { ApiError } from "../utils/ApiError.js";
import { submitToWorkflow, processWorkflowAction } from "./workflow.service.js";
import mongoose from "mongoose";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";
import { enrichWithWorkflowState } from "../utils/workflowHelper.js";

const createBillService = async (userId, body) => {
  const { Bill } = useModels();
  const { vendor, invoiceNo, itemDetails } = body;
  if (!vendor || !invoiceNo || !itemDetails || itemDetails.length === 0) {
    throw new ApiError(
      400,
      "Vendor, Invoice No and at least one Item Detail are required",
    );
  }

  const bill = await Bill.create({
    ...body,
    createdBy: userId,
    transactionStatus: "draft",
  });

  return bill;
};

const getBillsService = async (query = {}, user = null) => {
  const { Bill, WorkflowState, Workflow } = useModels();
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy,
    sortOrder,
    wfStatus,
    status,
    assignedToMe,
  } = query;
  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 10;

  const filter = {};
  if (search) {
    filter.$or = [
      { transactionId: { $regex: search, $options: "i" } },
      { invoiceNo: { $regex: search, $options: "i" } },
    ];
  }

  if (wfStatus) filter.workflowStatus = wfStatus;
  if (status) filter.transactionStatus = status;

  // Special logic for Dashboard KPI: Assigned to Me
  if (assignedToMe === "true" && user) {
    const wfRoles = user.workflowRoles || [];
    // Find all WorkflowStates where status is pending
    const pendingStates = await WorkflowState.find({
      status: "pending",
    }).populate("workflowId");

    // Filter those where current stage matches user's role
    const myTransactionIds = pendingStates
      .filter((s) => {
        const currentStage = s.workflowId?.WorkflowStage?.find(
          (st) => st.stageNumber === s.currentStageNumber,
        );
        return (
          currentStage &&
          wfRoles.some(
            (r) => r.toString() === currentStage.stageApproverRole?.toString(),
          )
        );
      })
      .map((s) => s.transactionId);

    filter._id = { $in: myTransactionIds };
  }

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const billsData = await Bill.paginate(filter, {
    page: pageNum,
    limit: limitNum,
    sort: sort,
    populate: [
      { path: "vendor", select: "fullName vendorId" },
      { path: "department", select: "description deptCode" },
      { path: "createdBy", select: "fullName email" },
    ],
  });

  const {
    docs,
    totalDocs,
    totalPages,
    page: currentPage,
    limit: currentLimit,
  } = billsData;
  const enrichedDocs = await enrichWithWorkflowState(docs, "Bill");
  return {
    docs: enrichedDocs,
    totalDocs,
    totalPages,
    page: currentPage,
    limit: currentLimit,
  };
};

const getBillByIdService = async (id) => {
  const { Bill } = useModels();

  // Check if id is a valid MongoId, otherwise treat as transactionId
  const query = getLookupQuery(id, "transactionId");

  const bill = await Bill.findOne(query).populate([
    { path: "vendor", select: "fullName vendorId" },
    { path: "department", select: "description deptCode" },
    { path: "subsidiary", select: "description subCode" },
    { path: "createdBy", select: "fullName email" },
    { path: "updatedBy", select: "fullName" },
    { path: "itemDetails.itemCode", select: "description itemCode" },
    { path: "itemDetails.uom", select: "description uomCode" },
  ]);

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return bill;
};

const updateBillService = async (id, body) => {
  const { Bill } = useModels();
  const query = getLookupQuery(id, "transactionId");
  const bill = await Bill.findOne(query);
  if (!bill) throw new ApiError(404, "Bill not found");

  if (bill.transactionStatus !== "draft") {
    throw new ApiError(400, "Only draft bills can be updated");
  }

  const updatedBill = await Bill.findOneAndUpdate(
    query,
    { $set: body },
    { new: true, runValidators: true },
  );

  return updatedBill;
};

const submitBillService = async (id, userId) => {
  const { Bill } = useModels();
  const query = getLookupQuery(id, "transactionId");
  const bill = await Bill.findOne(query);
  if (!bill) throw new ApiError(404, "Bill not found");

  if (bill.transactionStatus !== "draft") {
    throw new ApiError(400, "Bill is already submitted or processed");
  }

  // Trigger workflow
  const wfState = await submitToWorkflow(
    bill._id,
    "Bill",
    bill.billTotalAmount,
    userId,
    bill.department, // Using department for moduleContext
  );

  bill.transactionStatus = "submitted";
  bill.workflowId = wfState.workflowId;
  bill.workflowStatus = wfState.status;
  await bill.save();

  return bill;
};

const workflowActionService = async (id, userId, action, payload) => {
  const { Bill } = useModels();
  const query = getLookupQuery(id, "transactionId");
  const bill = await Bill.findOne(query);
  if (!bill) throw new ApiError(404, "Bill not found");

  const wfState = await processWorkflowAction(
    bill._id,
    "Bill",
    userId,
    action,
    payload,
  );

  bill.workflowStatus = wfState.status;
  if (wfState.status === "completed") {
    // Any final logic for completed bill
  }
  await bill.save();

  return bill;
};

const getWorkflowHistoryService = async (id) => {
  const { Bill, WorkflowLog } = useModels();
  const query = getLookupQuery(id, "transactionId");
  const bill = await Bill.findOne(query);
  if (!bill) return [];

  return await WorkflowLog.find({ transactionId: bill._id })
    .populate("userId", "fullName email")
    .sort({ createdAt: -1 });
};

export {
  createBillService,
  getBillsService,
  getBillByIdService,
  updateBillService,
  submitBillService,
  workflowActionService,
  getWorkflowHistoryService,
};
