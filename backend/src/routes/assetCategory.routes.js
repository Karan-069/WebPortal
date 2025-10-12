import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  addAssetCategory,
  getAssetCategories,
  getAssetCategoryById,
  toggleAssetCategoryStatus,
  updateAssetCategory,
} from "../controllers/assetCategory.controller";

const router = Router();

//Auth

router.use(verifyJWT);

//Routes

router.route("/").get(getAssetCategories).post(addAssetCategory);

router.route("/:catCode").get(getAssetCategoryById).patch(updateAssetCategory);

router.route("/:catCode/toggle-status").patch(toggleAssetCategoryStatus);
