import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllLicenses,
  getLicenseById,
  createLicense,
} from "../controllers/license.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllLicenses).post(createLicense);
router.route("/:id").get(getLicenseById);

export default router;
