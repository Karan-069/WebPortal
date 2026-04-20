import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLocations,
  getLocationById,
  addLocation,
  updateLocation,
  toggleLocationStatus,
} from "../controllers/location.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getLocations).post(addLocation);
router.route("/:id").get(getLocationById).patch(updateLocation);
router.route("/:id/toggle-status").patch(toggleLocationStatus);

export default router;
