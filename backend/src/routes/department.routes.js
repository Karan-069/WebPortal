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

router.route("/:deptCode").get(getDepartmentById).patch(updateDepartment);

router.route("/:deptCode/toggle-status").patch(toggleDepartmentStatus); // For Change Status

export default router;
