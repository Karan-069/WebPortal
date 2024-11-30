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
//router.use(verifyJWT);

//Routes
router.route("/").get(getCrterms).post(addCrterm);

router.route("/:termCode").get(getCrtermById).patch(updateCrterm);

router.route("/:termCode/toggle-status").patch(toggleCrtermStatus);

export default router;
