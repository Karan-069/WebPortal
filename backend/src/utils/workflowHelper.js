import { useModels } from "./tenantContext.js";

/**
 * Enriches a list of documents with their current workflow stage names.
 * Uses a single aggregation/lookup to minimize database hits.
 */
export const enrichWithWorkflowState = async (docs, transactionModel) => {
  if (!docs || docs.length === 0) return docs;

  const { WorkflowState, Workflow } = useModels();
  const transactionIds = docs.map((doc) => doc._id);

  // Find all active workflow states for these transactions
  const wfStates = await WorkflowState.find({
    transactionId: { $in: transactionIds },
    transactionModel,
  });

  if (wfStates.length === 0) return docs;

  // Get unique workflow IDs to fetch their stage definitions
  const workflowIds = [...new Set(wfStates.map((ws) => ws.workflowId))];
  const workflows = await Workflow.find({ _id: { $in: workflowIds } });

  // Map to easily find stage name by workflowId and stageNumber
  const stageMap = {};
  workflows.forEach((wf) => {
    stageMap[wf._id.toString()] = {};
    wf.WorkflowStage.forEach((stage) => {
      stageMap[wf._id.toString()][stage.stageNumber] = stage.stageName;
    });
  });

  // Attach stage name to each doc
  const docsWithState = docs.map((doc) => {
    const docObj = doc.toObject ? doc.toObject() : doc;
    const state = wfStates.find(
      (ws) => ws.transactionId.toString() === docObj._id.toString(),
    );

    if (state) {
      if (state.status === "completed") {
        docObj.currentStageName = "Approved";
      } else if (state.status === "rejected") {
        docObj.currentStageName = "Rejected";
      } else if (state.status === "clarification_requested") {
        docObj.currentStageName = "Clarification Needed";
      } else {
        docObj.currentStageName =
          stageMap[state.workflowId.toString()]?.[state.currentStageNumber] ||
          "Unknown";
      }
    } else {
      docObj.currentStageName =
        docObj.transactionStatus === "draft"
          ? "Draft"
          : docObj.transactionStatus || "Draft";
    }

    return docObj;
  });

  return docsWithState;
};
