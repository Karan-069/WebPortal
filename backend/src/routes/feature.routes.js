import { Router } from "express";
import {
  getFeatures,
  updateFeature,
} from "../controllers/feature.controller.js";

const router = Router();

router.route("/").get(getFeatures).post(updateFeature);

export default router;
