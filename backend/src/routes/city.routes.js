import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addCity,
  getCities,
  getCityById,
  toggleCityStatus,
  updateCity,
} from "../controllers/city.controller.js";

const router = Router();

//Auth
//router.use(verifyJWT);

//Routes
router.route("/").get(getCities).post(addCity);

router.route("/:cityCode").get(getCityById).patch(updateCity);

router.route("/:cityCode/toggle-status").patch(toggleCityStatus);

export default router;
