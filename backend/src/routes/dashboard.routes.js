import { Router } from "express";
import {
  getDashboardConfig,
  getDashboardMetrics,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to all routes in this file
router.use(verifyJWT);

router.route("/config").get(getDashboardConfig);
router.route("/metrics/:metricId").get(getDashboardMetrics);

export default router;
