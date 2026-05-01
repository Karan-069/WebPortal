import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLoginLogs,
  getLoginLogById,
} from "../controllers/loginLog.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getLoginLogs);
router.route("/:id").get(getLoginLogById);

export default router;
