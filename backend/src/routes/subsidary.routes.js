import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addSubsidary,
  getSubsidaries,
  getSubsidaryById,
  toggleSubsidaryStatus,
  updateSubsidary,
} from "../controllers/subsidary.controller.js";

const router = Router();

//Auth
router.use(verifyJWT);

//Routes
router.route("/").get(getSubsidaries).post(addSubsidary);
router.route("/:id").get(getSubsidaryById).patch(updateSubsidary);
router.route("/:id/toggle-status").patch(toggleSubsidaryStatus);

export default router;
