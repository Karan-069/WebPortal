import { Router } from "express";
import {
  getAllSequences,
  getSequenceById,
  updateSequence,
} from "../controllers/nextTransactionId.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getAllSequences);
router.route("/:id").get(getSequenceById).patch(updateSequence);

export default router;
