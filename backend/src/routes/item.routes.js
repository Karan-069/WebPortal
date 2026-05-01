import { Router } from "express";
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  submitItem,
  toggleItemStatus,
} from "../controllers/item.controller.js";

const router = Router();

/**
 * NOTE: verifyJWT and autoCheckPermission are applied GLOBALLY in app.js.
 * No need for local middleware here unless specialized checks are needed.
 */

router.route("/").get(getItems).post(createItem);

router.route("/:id").get(getItemById).patch(updateItem);

router.route("/:id/toggle-status").patch(toggleItemStatus);

router.route("/:id/submit").patch(submitItem);

export default router;
