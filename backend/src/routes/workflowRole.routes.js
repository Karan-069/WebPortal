import {
  addWorkflowRole,
  getWorkflowRole,
  getWorkflowRoleById,
  updateWorkflowRole,
} from "../controllers/workflowRole.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

//Auth
//router.use(verifyJWT);

// Routes
router.route("/").get(getWorkflowRole).post(addWorkflowRole);

router.route("/:wfRoleCode").get(getWorkflowRoleById).patch(updateWorkflowRole);

export default router;
