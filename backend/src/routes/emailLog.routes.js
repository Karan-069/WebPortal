import { Router } from "express";
import {
  getEmailLogs,
  getEmailLogById,
} from "../controllers/emailLog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getEmailLogs);
router.route("/:id").get(getEmailLogById);

export default router;
