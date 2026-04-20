import { Router } from "express";
import {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  toggleAssetStatus,
} from "../controllers/asset.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getAllAssets).post(createAsset);
router.route("/:id").get(getAssetById).patch(updateAsset);
router.route("/:id/toggle-status").patch(toggleAssetStatus);

export default router;
