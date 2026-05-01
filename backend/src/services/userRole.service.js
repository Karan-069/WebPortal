import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { toggleStatus } from "../utils/toggleStatus.js";
import { useModels } from "../utils/tenantContext.js";
import { getLookupQuery } from "../utils/lookupHelper.js";

const getUserRoleService = async (query) => {
  const { UserRole } = useModels();
  const { page = 1, limit = 50, search = "", sortBy, sortOrder } = query;

  const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 50;

  const filter = {};
  if (search) {
    filter.$or = [
      { roleCode: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const userRoles = await UserRole.paginate(filter, {
    page: pageNum,
    limit: limitNum,
    populate: [
      { path: "createdBy", select: "fullName" },
      { path: "updatedBy", select: "fullName" },
    ],
  });

  const { docs, ...pagination } = userRoles;
  return { docs, ...pagination };
};

const getUserRoleByIDService = async (id) => {
  const { UserRole } = useModels();
  const query = getLookupQuery(id, "roleCode");
  const getUserRole = await UserRole.findOne(query).populate(
    "createdBy updatedBy",
    "fullName",
  );
  if (!getUserRole) {
    throw new ApiError(404, "User Role not Found!!");
  }

  if (getUserRole.PopulateMenus) {
    await getUserRole.PopulateMenus();
  }

  return getUserRole;
};

const addUserRoleService = async (body) => {
  const { UserRole, AppMenu } = useModels();
  const { roleCode, description, menus } = body;

  if (!roleCode) {
    throw new ApiError(400, "Role Code is Madatory!!");
  }

  const existingUserRole = await UserRole.findOne({ roleCode: roleCode });
  if (existingUserRole) {
    throw new ApiError(400, "User Role already Exists!!");
  }

  // Flatten menus: extract ID from object if needed
  const processedMenus = (menus || []).map((m) => ({
    ...m,
    menuId: m.menuId?._id || m.menuId?.value || m.menuId,
  }));

  const menuIds = processedMenus.map((m) => m.menuId);

  const validMenus = await AppMenu.find({ _id: { $in: menuIds } });
  if (validMenus.length !== menuIds.length) {
    throw new ApiError(400, "One or more Menus are invalid!!");
  }

  const createRole = await UserRole.create({
    ...body,
    menus: processedMenus,
  });

  if (createRole) {
    await createRole.populate("createdBy updatedBy", "fullName");
    if (createRole.PopulateMenus) {
      await createRole.PopulateMenus();
    }
  }

  return createRole;
};

const updateUserRoleService = async (id, body) => {
  const { UserRole, AppMenu } = useModels();
  const { description, menus } = body;

  const query = getLookupQuery(id, "roleCode");
  const existingUserRole = await UserRole.findOne(query);
  if (!existingUserRole) {
    throw new ApiError(400, "User Role does not Exists!!");
  }

  // Flatten menus: extract ID from object if needed
  const processedMenus = (menus || []).map((m) => ({
    ...m,
    menuId: m.menuId?._id || m.menuId?.value || m.menuId,
  }));

  const invalidMenuIds = processedMenus.filter(
    (menu) => !mongoose.Types.ObjectId.isValid(menu.menuId),
  );
  if (invalidMenuIds.length > 0) {
    throw new ApiError(
      400,
      "One or more Menu IDs are not in Valid MenuId Format!!",
    );
  }

  const menuIds = processedMenus.map((m) => m.menuId);

  const validMenus = await AppMenu.find({
    _id: {
      $in: menuIds,
    },
  });
  if (validMenus.length !== menuIds.length) {
    throw new ApiError(400, "One or more Menus are Invalid!!");
  }

  const updatedUserRole = await UserRole.findByIdAndUpdate(
    existingUserRole._id,
    {
      $set: {
        ...body,
        menus: processedMenus,
      },
    },
    { new: true, runValidators: true },
  ).populate("createdBy updatedBy", "fullName");

  if (!updatedUserRole) {
    throw new ApiError(500, "Failed Updating User Role!!");
  }

  if (updatedUserRole.PopulateMenus) {
    await updatedUserRole.PopulateMenus();
  }

  return updatedUserRole;
};

const toggleUserRoleStatusService = async (id) => {
  const { UserRole } = useModels();

  const query = getLookupQuery(id, "roleCode");
  const existingUserRole = await UserRole.findOne(query);
  if (!existingUserRole) throw new ApiError(404, "User Role not found");

  const { updatedRecord, successMessage } = await toggleStatus(
    UserRole,
    existingUserRole._id,
  );

  return { updatedRecord, successMessage };
};

export {
  getUserRoleService,
  getUserRoleByIDService,
  addUserRoleService,
  updateUserRoleService,
  toggleUserRoleStatusService,
};
