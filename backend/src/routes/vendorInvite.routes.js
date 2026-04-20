import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVendorInvites,
  initiateInvite,
  reinitiateInvite,
  verifyInviteToken,
  verifyPan,
  registerVendor,
} from "../controllers/vendorInvite.controller.js";

const router = Router();

// ----- Public / Unprotected Routes -----
// Used by vendors registering via email link
router.route("/verify/:token").get(verifyInviteToken);

// Frontend passes token in req.body, so no params in route
router.route("/verify-pan").post(verifyPan);
router.route("/register").post(registerVendor);

// ----- Protected / Internal User Routes -----
// Used by internal staff to manage invites
router.use(verifyJWT);

// Get all invites (can add role auth here if needed)
router.route("/").get(getVendorInvites);

// Initiate novel invite
router.route("/initiate").post(initiateInvite);

// Re-initiate expired invite
router.route("/reinitiate/:id").post(reinitiateInvite);

export default router;
