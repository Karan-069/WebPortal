import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

//Routes
router.route("/register").post(registerUser);