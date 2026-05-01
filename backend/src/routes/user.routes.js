import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { licenseCheck } from "../middlewares/license.middleware.js";
import {
  loginUser,
  refreshToken,
  registerUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  logoutUser,
  changeUserPassword,
  resetUserPassword,
  switchRole,
} from "../controllers/user.controller.js";

const router = Router();

// Public routes (no auth required)
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);

// Protected routes
//router.use();

router.get("/", verifyJWT, getAllUsers);
router.post("/", verifyJWT, licenseCheck, registerUser);
router.get("/current-user", verifyJWT, getCurrentUser);
router.get("/:id", verifyJWT, getCurrentUser); // Mapping to same logic or specific getById
router.patch("/:id", verifyJWT, updateUser);
router.patch("/deactivate/:id", verifyJWT, deactivateUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeUserPassword);
router.post("/switch-role", verifyJWT, switchRole);
router.post("/reset-password", verifyJWT, resetUserPassword);

export default router;
