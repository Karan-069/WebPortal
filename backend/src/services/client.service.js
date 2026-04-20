import { useModels } from "../utils/tenantContext.js";
import { ApiError } from "../utils/ApiError.js";

const getClientsService = async (queryParams) => {
  const { Client } = useModels();
  const { page = 1, limit = 10, search = "" } = queryParams;

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { slug: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // Note: Client is a global model, usually accessed directly
  return await Client.find(query).sort({ createdAt: -1 });
};

const getClientByIdService = async (id) => {
  const { Client } = useModels();
  const client = await Client.findById(id);
  if (!client) throw new ApiError(404, "Client not found");
  return client;
};

const createClientService = async (data) => {
  const { Client } = useModels();
  return await Client.create(data);
};

export { getClientsService, getClientByIdService, createClientService };
