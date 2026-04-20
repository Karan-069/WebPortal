import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addUom,
  getUoms,
  getUomById,
  updateUom,
  toggleUomStatus,
} from "../controllers/uom.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUoms).post(addUom);

router.route("/:id").get(getUomById).patch(updateUom);

router.route("/:id/toggle-status").patch(toggleUomStatus);

export default router;
