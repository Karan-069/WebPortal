import { useModels } from "../utils/tenantContext.js";

const getMenusService = async (query) => {
  const { AppMenu } = useModels();
  const { page = 1, limit = 50, sortBy, sortOrder } = query;

  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const existingMenus = await AppMenu.paginate(
    {},
    {
      page: pageNum,
      limit: limitNum,
      sort: sort,
    },
  );

  const { docs, ...pagination } = existingMenus;
  return { data: docs, pagination };
};

export { getMenusService };
