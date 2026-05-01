import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUserDelegations,
  getUserDelegationById,
  addUserDelegation,
  updateUserDelegation,
  toggleUserDelegationStatus,
} from "../controllers/userDelegation.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getUserDelegations).post(addUserDelegation);
router.route("/:id").get(getUserDelegationById).put(updateUserDelegation);
router.route("/toggle-status/:id").put(toggleUserDelegationStatus);

export default router;
