import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getEmailTemplatesService,
  getEmailTemplateByIdService,
  createEmailTemplateService,
  updateEmailTemplateService,
} from "../services/emailTemplate.service.js";

const getEmailTemplates = asyncHandler(async (req, res) => {
  const result = await getEmailTemplatesService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Email templates fetched successfully"));
});

const getEmailTemplateById = asyncHandler(async (req, res) => {
  const template = await getEmailTemplateByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template fetched successfully"));
});

const createEmailTemplate = asyncHandler(async (req, res) => {
  const template = await createEmailTemplateService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, template, "Template created successfully"));
});

const updateEmailTemplate = asyncHandler(async (req, res) => {
  const template = await updateEmailTemplateService(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template updated successfully"));
});

export {
  getEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
};
