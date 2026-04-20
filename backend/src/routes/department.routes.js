import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addDepartment,
  getDepartmentById,
  getDepartments,
  toggleDepartmentStatus,
  updateDepartment,
} from "../controllers/department.controller.js";

const router = Router();

//Auth
router.use(verifyJWT);

//Routes
router.route("/").get(getDepartments).post(addDepartment);

router.route("/:id").get(getDepartmentById).patch(updateDepartment);

router.route("/:id/toggle-status").patch(toggleDepartmentStatus); // For Change Status

export default router;
