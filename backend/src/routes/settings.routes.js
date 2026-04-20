import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllSettings,
  getSettingsById,
  updateSettings,
} from "../controllers/settings.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllSettings);
router.route("/:id").get(getSettingsById).patch(updateSettings);

export default router;
