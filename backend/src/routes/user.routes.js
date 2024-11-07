import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";

const router = Router();

//Routes
router.route("/register").post(registerUser);

router.route("/login").post(loginUser);



export default router;