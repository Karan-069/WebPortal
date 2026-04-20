import {
  addWorkflowRole,
  getWorkflowRole,
  getWorkflowRoleById,
  toggleWorkflowRoleStatus,
  updateWorkflowRole,
} from "../controllers/workflowRole.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

//Auth
router.use(verifyJWT);

// Routes
router.route("/").get(getWorkflowRole).post(addWorkflowRole);
router.route("/:id").get(getWorkflowRoleById).patch(updateWorkflowRole);
router.route("/:id/toggle-status").patch(toggleWorkflowRoleStatus);

export default router;
