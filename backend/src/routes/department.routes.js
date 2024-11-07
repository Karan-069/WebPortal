import { Router } from "express";
import {verfyJWT } from "../middlewares/auth.middleware.js";
import { addDepartment, getDepartmentById, getDepartments } from "../controllers/department.controller";
const router = Router();

//Auth
router.use(verfyJWT);

//Routes
router.route("/")
    .get(getDepartments)
    .post(addDepartment)

router.route("/:deptId")
    .get(getDepartmentById)
    .put()
    .delete()



export default router;
