import { ApiError } from "../utils/ApiError.js";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getUomsService = async (query) => {
  const { Uom } = useModels();
  const {
    page: requestedPage = 1,
    limit: requestedLimit = 50,
    sortBy,
    sortOrder,
  } = query;
  const pageNum = parseInt(requestedPage) > 0 ? parseInt(requestedPage) : 1;
  const limitNum = parseInt(requestedLimit) > 0 ? parseInt(requestedLimit) : 50;

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }
  const uomData = await Uom.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    },
  );

  if (!uomData) {
    throw new ApiError(500, "An Error Occured while Fetching UOMs!!");
  }

  const { docs, totalDocs, totalPages, page, limit } = uomData;
  return { docs, totalDocs, totalPages, page, limit };
};

const getUomByIdService = async (id) => {
  const { Uom } = useModels();
  if (!id) throw new ApiError(400, "Identifier Missing!!");

  const query = getLookupQuery(id, "uomCode");
  const isUomValid = await Uom.findOne(query).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!isUomValid) {
    throw new ApiError(404, "Invalid Unit of Messurement!!");
  }

  return isUomValid;
};

const addUomService = async (body) => {
  const { Uom } = useModels();
  const { uomCode, description } = body;

  if (!uomCode) {
    throw new ApiError(400, "Uom Code is Mandatory!!");
  }

  const isUomExists = await Uom.findOne({ uomCode });
  if (isUomExists) {
    throw new ApiError(400, "Uom Code Already Exisits!!");
  }

  const newUom = await Uom.create({
    uomCode,
    description,
  });

  if (newUom) {
    await newUom.populate("createdBy updatedBy", "fullName");
  }

  return newUom;
};

const updateUomService = async (id, body) => {
  const { Uom } = useModels();
  const { description } = body;

  if (!id) throw new ApiError(400, "Identifier is Missing.");

  const query = getLookupQuery(id, "uomCode");
  const isUomValid = await Uom.findOne(query);
  if (!isUomValid) {
    throw new ApiError(404, "Invalid Unit of Messurement!!");
  }

  const updatedUom = await Uom.findByIdAndUpdate(
    isUomValid._id,
    { $set: body },
    { new: true, runValidators: true },
  ).populate("createdBy updatedBy", "fullName");

  if (!updatedUom) {
    throw new ApiError(500, "An Error Occured while Updaing UOM");
  }

  return updatedUom;
};

const toggleUomStatusService = async (id) => {
  const { Uom } = useModels();
  if (!id) throw new ApiError(400, "Identifier is Mandandatory!");

  const query = getLookupQuery(id, "uomCode");
  const isUomValid = await Uom.findOne(query);
  if (!isUomValid) {
    throw new ApiError(404, "Invalid Unit of Mesurement!");
  }

  const { updatedRecord, successMessage } = await toggleStatus(
    Uom,
    isUomValid._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getUomsService,
  getUomByIdService,
  addUomService,
  updateUomService,
  toggleUomStatusService,
};
