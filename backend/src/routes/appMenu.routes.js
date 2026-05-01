import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getMenus,
  getMenuById,
  getMyMenus,
} from "../controllers/appmenu.controller.js";

const router = Router();

//Routes
router.use(verifyJWT);

router.route("/").get(getMenus);
router.route("/my-menus").get(getMyMenus);
router.route("/:id").get(getMenuById);

export default router;
