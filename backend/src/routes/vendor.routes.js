import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  toggleVendorStatus,
  submitVendorProfile,
  getMyVendorProfile,
} from "../controllers/vendor.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getVendors).post(createVendor);

router.get("/profile/me", getMyVendorProfile);
router.post("/profile/submit", submitVendorProfile);

router.route("/:id").get(getVendorById).patch(updateVendor);

router.route("/:id/toggle-status").patch(toggleVendorStatus);

export default router;
