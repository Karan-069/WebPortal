import mongoose from "mongoose";
import { useModels } from "../utils/tenantContext.js";

const getWorkflowLogsService = async (queryParams) => {
  const { WorkflowLog } = useModels();
  const {
    page = 1,
    limit = 10,
    search = "",
    transactionId,
    transactionModel,
  } = queryParams;

  const query = {};

  if (transactionId) {
    if (mongoose.isValidObjectId(transactionId)) {
      query.transactionId = new mongoose.Types.ObjectId(transactionId);
    } else {
      query.transactionId = transactionId;
    }
  }

  if (transactionModel) {
    query.transactionModel = {
      $regex: new RegExp(`^${transactionModel}$`, "i"),
    };
  }

  if (search) {
    query.$or = [
      { transactionModel: { $regex: search, $options: "i" } },
      { StageStatus: { $regex: search, $options: "i" } },
      { comments: { $regex: search, $options: "i" } },
    ];
  }

  return await WorkflowLog.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "userId", select: "fullName email" },
      { path: "workflowId", select: "description" },
    ],
  });
};

export { getWorkflowLogsService };
