import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createBill,
  getBills,
  getBillById,
  updateBill,
  submitBill,
  workflowAction,
  getBillHistory,
} from "../controllers/bill.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createBill).get(getBills);

router.route("/:id").get(getBillById).patch(updateBill);

router.route("/:id/submit").post(submitBill);

router.route("/:id/workflow-action").post(workflowAction);

router.route("/:id/workflow-history").get(getBillHistory);

export default router;
