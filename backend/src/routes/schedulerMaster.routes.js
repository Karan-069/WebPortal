import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSchedulerMasters,
  getSchedulerMasterById,
  addSchedulerMaster,
  updateSchedulerMaster,
  toggleSchedulerMasterStatus,
} from "../controllers/schedulerMaster.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getSchedulerMasters).post(addSchedulerMaster);
router.route("/:id").get(getSchedulerMasterById).put(updateSchedulerMaster);
router.route("/toggle-status/:id").put(toggleSchedulerMasterStatus);

export default router;
