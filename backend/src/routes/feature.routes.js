import { Router } from "express";
import {
  getFeatures,
  addFeature,
  getFeatureById,
  updateFeature,
  toggleFeatureStatus,
  getFeatureMap,
  seedFeatures,
} from "../controllers/feature.controller.js";

const router = Router();

router.post("/seed", seedFeatures);
router.get("/map", getFeatureMap);

router.route("/").get(getFeatures).post(addFeature);

router.route("/:id").get(getFeatureById).patch(updateFeature);

router.route("/:id/toggle-status").patch(toggleFeatureStatus);

export default router;
