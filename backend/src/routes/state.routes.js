import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addState,
  getStates,
  getStateById,
  toggleStateStatus,
  updateState,
} from "../controllers/state.controller.js";

const router = Router();

//Secure Routes
router.use(verifyJWT);

//Routes
router.route("/").get(getStates).post(addState);

router.route("/:stateCode").get(getStateById).patch(updateState);

router.route("/:stateCode/toggle-status").patch(toggleStateStatus);

export default router;
