import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getClientsService,
  getClientByIdService,
  createClientService,
} from "../services/client.service.js";

const getAllClients = asyncHandler(async (req, res) => {
  const result = await getClientsService(req.query);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { docs: result, totalDocs: result.length, totalPages: 1 },
        "Clients fetched successfully",
      ),
    );
});

const getClientById = asyncHandler(async (req, res) => {
  const client = await getClientByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, client, "Client fetched successfully"));
});

const createClient = asyncHandler(async (req, res) => {
  const client = await createClientService(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, client, "Client created successfully"));
});

export { getAllClients, getClientById, createClient };
