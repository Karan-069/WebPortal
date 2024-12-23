import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMenus } from "../controllers/appMenu.controller.js";

const router = Router();

//Routes
//router.use(verifyJWT);

router.route("/").get(getMenus);

export default router;
