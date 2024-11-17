import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addUserRole,
  getUserRole,
  getUserRoleByID,
  toggleUserRoleStatus,
  updateUserRole,
} from "../controllers/userRole.controller.js";

const router = Router();

//Routes
router.use(verifyJWT);

router.route("/").get(getUserRole).post(addUserRole);

router.route("/:roleCode").get(getUserRoleByID).patch(updateUserRole);

router.route("/:roleCode/toggle-status").patch(toggleUserRoleStatus); // Change Status

export default router;
