import { Router } from "express";
import {
  initiateWorkflow,
  processAction,
  bulkProcessActions,
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  toggleWorkflowStatus,
  amendWorkflow,
  getWorkflowState,
} from "../controllers/workflow.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

// Engine actions
router.route("/initiate").post(initiateWorkflow);
router.route("/amend").post(amendWorkflow);
router.route("/action").post(processAction);
router.route("/get-state").get(getWorkflowState);
router.route("/bulk-action").post(bulkProcessActions);

// Administrative Definitions
router.route("/").get(getAllWorkflows).post(createWorkflow);
router.route("/:id").get(getWorkflowById).patch(updateWorkflow);
router.route("/:id/toggle-status").patch(toggleWorkflowStatus);

export default router;
