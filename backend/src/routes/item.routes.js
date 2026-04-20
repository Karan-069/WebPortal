import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  submitItem,
  toggleItemStatus,
} from "../controllers/item.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getItems).post(createItem);

router.route("/:id").get(getItemById).patch(updateItem);

router.route("/:id/toggle-status").patch(toggleItemStatus);

router.route("/:id/submit").patch(submitItem);

export default router;
