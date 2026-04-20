import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
} from "../controllers/emailTemplate.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getEmailTemplates).post(createEmailTemplate);
router.route("/:id").get(getEmailTemplateById).patch(updateEmailTemplate);

export default router;
