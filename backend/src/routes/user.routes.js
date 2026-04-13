import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  logoutUser,
  changeUserPassword,
} from "../controllers/user.controller.js";

const router = Router();

//router.post("/register", verifyJWT, registerUser);
router.post("/register", registerUser);

router.get("/current-user", verifyJWT, getCurrentUser);

router.get("/all", verifyJWT, getAllUsers);

router.put("/update/:id", verifyJWT, updateUser);

router.patch("/deactivate/:id", verifyJWT, deactivateUser);

router.post("/logout", verifyJWT, logoutUser);

router.post("/change-password", verifyJWT, changeUserPassword);

export default router;
