import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllClients,
  getClientById,
  createClient,
} from "../controllers/client.controller.js";

const router = Router();

// Protect all internal admin routes
router.use(verifyJWT);

router.route("/").get(getAllClients).post(createClient);
router.route("/:id").get(getClientById);

export default router;
