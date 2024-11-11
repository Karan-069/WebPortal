import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addUserRole,
  getUserRole,
} from "../controllers/userRole.comtroller.js";

const router = Router();

//Routes
//router.use(verifyJWT);

router.route("/").get(getUserRole).post(addUserRole);

export default router;
