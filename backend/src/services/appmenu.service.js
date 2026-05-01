import mongoose from "mongoose";
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
  return { docs, ...pagination };
};

const getMenuByIdService = async (id) => {
  const { AppMenu } = useModels();

  // Try finding by _id first, then by menuId code
  let menu = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    menu = await AppMenu.findById(id);
  }

  if (!menu) {
    menu = await AppMenu.findOne({ menuId: id });
  }

  return menu;
};

const getMyMenusService = async (user, query = {}) => {
  const { AppMenu, UserRole, User } = useModels();
  const { forSidebar = false } = query;

  // 1. Super Admin: Always sees EVERYTHING
  if (user.isSuperAdmin) {
    return await AppMenu.find({ isActive: true }).sort({ sortOrder: 1 });
  }

  // 2. Role-Based Sidebar Logic
  if (forSidebar) {
    let currentUser = user;

    // Deep Recovery: If user object in session is missing role context, refetch it
    if (!currentUser.activeRole && !currentUser.userRole) {
      const dbUser = await User.findById(user._id).lean();
      if (dbUser) {
        currentUser = {
          ...dbUser,
          activeRole:
            dbUser.activeRole ||
            (dbUser.defaultRoleAssignment &&
              dbUser.defaultRoleAssignment.userRole),
        };
      }
    }

    let roleData = currentUser.activeRole || currentUser.userRole;

    // If we only have an ID, fetch the full role document
    if (roleData && (!roleData.menus || !Array.isArray(roleData.menus))) {
      const roleId = roleData._id || roleData;
      if (mongoose.Types.ObjectId.isValid(roleId)) {
        roleData = await UserRole.findById(roleId).lean();
      }
    }

    if (!roleData || !roleData.menus || roleData.menus.length === 0) {
      // Emergency Fallback: If role has NO menus assigned, show tenant-scoped defaults
      // instead of a blank screen, to allow basic navigation.
      return await AppMenu.find({ scope: "tenant", isActive: true }).sort({
        sortOrder: 1,
      });
    }

    // Extract validated Menu IDs
    const myMenuIds = roleData.menus
      .map((m) => {
        // Handle both simple IDs and populated menu objects
        const id = m.menuId?._id || m.menuId?.id || m.menuId;
        return id;
      })
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    if (myMenuIds.length === 0) {
      return await AppMenu.find({ scope: "tenant", isActive: true }).sort({
        sortOrder: 1,
      });
    }

    const assignedMenus = await AppMenu.find({
      _id: { $in: myMenuIds },
      isActive: true,
    }).sort({ sortOrder: 1 });

    // Final Fallback: If all assigned menus are inactive/missing, show defaults
    if (assignedMenus.length === 0) {
      return await AppMenu.find({ scope: "tenant", isActive: true }).sort({
        sortOrder: 1,
      });
    }

    return assignedMenus;
  }

  // 3. Global/Tenant scoped menus for non-sidebar contexts
  return await AppMenu.find({ scope: "tenant", isActive: true }).sort({
    sortOrder: 1,
  });
};

export { getMenusService, getMenuByIdService, getMyMenusService };
