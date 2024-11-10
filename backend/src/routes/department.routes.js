import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addDepartment,
  deactivateDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
} from "../controllers/department.controller.js";
const router = Router();

//Auth
router.use(verifyJWT);

//Routes
router.route("/").get(getDepartments).post(addDepartment);

router.route("/:deptId").get(getDepartmentById).put(updateDepartment); // For updates

router.route("/:deptId/deactivate").put(deactivateDepartment); // For deactivation

export default router;
