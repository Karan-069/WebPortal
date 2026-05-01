import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSchedulerLogs,
  getSchedulerLogById,
  addSchedulerLog,
  updateSchedulerLog,
  toggleSchedulerLogStatus,
} from "../controllers/schedulerLog.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getSchedulerLogs).post(addSchedulerLog);
router.route("/:id").get(getSchedulerLogById).put(updateSchedulerLog);
router.route("/toggle-status/:id").put(toggleSchedulerLogStatus);

export default router;
