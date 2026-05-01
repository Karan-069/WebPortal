import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAuditLogs,
  getAuditLogById,
} from "../controllers/auditLog.controller.js";

const router = Router();

// Protect all audit log routes
router.use(verifyJWT);

// GET /api/v1/audit-logs
router.get("/", getAuditLogs);
router.get("/:id", getAuditLogById);

export default router;
