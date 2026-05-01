import { useModels } from "../utils/tenantContext.js";
import { ApiError } from "../utils/ApiError.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getEmailTemplatesService = async (queryParams) => {
  const { EmailTemplate } = useModels();
  const { page = 1, limit = 10, search = "" } = queryParams;

  const query = search
    ? {
        $or: [
          { templateName: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const result = await EmailTemplate.paginate(query, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
  });

  const { docs, ...pagination } = result;
  return { docs, ...pagination };
};

const getEmailTemplateByIdService = async (id) => {
  const { EmailTemplate } = useModels();
  const query = getLookupQuery(id, "templateCode");
  const template = await EmailTemplate.findOne(query);
  if (!template) throw new ApiError(404, "Template not found");
  return template;
};

const createEmailTemplateService = async (data) => {
  const { EmailTemplate } = useModels();
  return await EmailTemplate.create(data);
};

const updateEmailTemplateService = async (id, data) => {
  const { EmailTemplate } = useModels();
  const query = getLookupQuery(id, "templateCode");
  const template = await EmailTemplate.findOneAndUpdate(
    query,
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!template) throw new ApiError(404, "Template not found");
  return template;
};

export {
  getEmailTemplatesService,
  getEmailTemplateByIdService,
  createEmailTemplateService,
  updateEmailTemplateService,
};
