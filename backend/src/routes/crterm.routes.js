import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addCrterm,
  getCrtermById,
  getCrterms,
  toggleCrtermStatus,
  updateCrterm,
} from "../controllers/crterm.controller.js";

const router = Router();

//Auth
router.use(verifyJWT);

//Routes
router.route("/").get(getCrterms).post(addCrterm);

router.route("/:id").get(getCrtermById).patch(updateCrterm);

router.route("/:id/toggle-status").patch(toggleCrtermStatus);

export default router;
