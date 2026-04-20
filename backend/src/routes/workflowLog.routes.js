import { Router } from "express";
import { getAllWorkflowLogs } from "../controllers/workflowLog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Secure all logs

router.route("/").get(getAllWorkflowLogs);

export default router;
