import { Router } from "express";
import {
  getDashboardConfig,
  getDashboardMetrics,
  getDashboardLayouts,
  addDashboardLayout,
  getDashboardLayoutById,
  updateDashboardLayout,
  deleteDashboardLayout,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to all routes in this file
router.use(verifyJWT);

router.route("/config").get(getDashboardConfig);
router.route("/metrics/:metricId").get(getDashboardMetrics);

// ─── Layouts CRUD ───
router.route("/layouts").get(getDashboardLayouts).post(addDashboardLayout);

router
  .route("/layouts/:id")
  .get(getDashboardLayoutById)
  .put(updateDashboardLayout)
  .delete(deleteDashboardLayout);

export default router;
