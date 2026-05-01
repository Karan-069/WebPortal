import { Router } from "express";
import {
  getLOBs,
  getLOBById,
  addLOB,
  updateLOB,
  toggleLOBStatus,
} from "../controllers/lineOfBusiness.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getLOBs).post(addLOB);
router.route("/:id").get(getLOBById).patch(updateLOB);
router.route("/:id/toggle-status").patch(toggleLOBStatus);

export default router;
