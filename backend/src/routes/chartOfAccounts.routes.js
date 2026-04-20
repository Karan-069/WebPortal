import { Router } from "express";
import {
  getCOAs,
  getCOAById,
  addCOA,
  updateCOA,
  toggleCOAStatus,
} from "../controllers/chartOfAccounts.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getCOAs).post(addCOA);
router.route("/:id").get(getCOAById).put(updateCOA);
router.route("/:id/toggle-status").patch(toggleCOAStatus);

export default router;
