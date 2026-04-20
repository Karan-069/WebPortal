import { ApiError } from "../utils/ApiError.js";
import { useModels } from "../utils/tenantContext.js";

const getSequencesService = async (queryParams) => {
  const { NextTransactionId } = useModels();
  const { search = "" } = queryParams;

  const query = search
    ? {
        $or: [
          { menuId: { $regex: search, $options: "i" } },
          { prefix: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const sequences = await NextTransactionId.find(query).sort({ menuId: 1 });

  return {
    docs: sequences,
    totalDocs: sequences.length,
    totalPages: 1,
    limit: 100,
  };
};

import { getLookupQuery } from "../utils/lookupHelper.js";

const getSequenceByIdService = async (id) => {
  const { NextTransactionId } = useModels();
  const query = getLookupQuery(id, "menuId");
  const sequence = await NextTransactionId.findOne(query);
  if (!sequence) throw new ApiError(404, "Sequence not found");
  return sequence;
};

const updateSequenceService = async (id, data) => {
  const { NextTransactionId } = useModels();
  const { prefix, sequenceValue } = data;

  const query = getLookupQuery(id, "menuId");
  const sequence = await NextTransactionId.findOneAndUpdate(
    query,
    { $set: { prefix, sequenceValue } },
    { new: true, runValidators: true },
  );

  if (!sequence) throw new ApiError(404, "Sequence not found");
  return sequence;
};

export { getSequencesService, getSequenceByIdService, updateSequenceService };
