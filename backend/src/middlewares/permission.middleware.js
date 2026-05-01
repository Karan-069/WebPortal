import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppMenu } from "../models/appMenu.model.js";

/**
 * Permission Hierarchy Logic (Synced with Frontend)
 */
const HIERARCHY = {
  view: ["view", "add", "edit", "delete", "all", "approve", "submit"],
  add: ["add", "all"],
  edit: ["edit", "all"],
  delete: ["delete", "all"],
  approve: ["approve", "all"],
  submit: ["submit", "all"],
};

/**
 * Maps HTTP Methods to required Actions
 */
const METHOD_ACTION_MAP = {
  GET: "view",
  POST: "add",
  PATCH: "edit",
  PUT: "edit",
  DELETE: "delete",
};

/**
 * Automatic Permission Guard
 *
 * Dynamically inferred from the URL segment (matching AppMenu.slug) and HTTP Method.
 */
export const autoCheckPermission = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // 1. Explicitly bypass verification for public and self-service auth routes
  const publicPaths = [
    "/api/v1/users/login",
    "/api/v1/users/refresh-token",
    "/api/v1/users/current-user",
    "/api/v1/users/logout",
    "/api/v1/users/switch-role",
    "/api/v1/users/change-password",
    "/api/v1/app-menus/my-menus",
  ];
  const currentPath = req.originalUrl.split("?")[0];
  if (publicPaths.some((path) => currentPath === path)) return next();

  // 2. Identify the target segment (e.g. /api/v1/items -> items)
  const segments = currentPath.split("/");
  const targetSegment = segments[3];

  if (!targetSegment) return next();

  // 3. Identify the Required Action from Method
  const requiredAction = METHOD_ACTION_MAP[req.method];
  if (!requiredAction) return next();

  // WORKFLOW ACTION BYPASS: All workflow sub-routes are gated by the service layer,
  // not the permission middleware. This covers GET (get-state), POST (submit/action),
  // PATCH (amend/recall), and any other method on the workflows route.
  if (targetSegment === "workflows") {
    return next();
  }

  if (!user || !user.activeRole) {
    throw new ApiError(403, "Access Denied: No active role identified");
  }

  // 4. DYNAMIC MODULE DISCOVERY
  const menuDoc = await AppMenu.findOne({
    $or: [{ slug: targetSegment }, { menuId: targetSegment.replace(/s$/, "") }],
    isActive: true,
  });

  // 5. ENTERPRISE GATEWAY LOGIC
  if (!menuDoc) {
    // Whitelist for strictly internal system routes that don't have menu entries
    const internalRoutes = [
      "dashboard",
      "notifications",
      "metadata",
      "features",
      "workflows",
      "workflow-logs",
      "audit-logs",
    ];
    if (internalRoutes.includes(targetSegment)) return next();

    console.warn(
      `[Permission] No module definition found for slug '${targetSegment}'`,
    );
    throw new ApiError(
      404,
      `Module not found or not configured: ${targetSegment}`,
    );
  }

  // 6. LOOKUP & READ-ONLY ACCESS (Standard Enterprise Pattern)
  // Master data lookups (LOB, COA, etc.) should be viewable by any authenticated user
  // to prevent linking/population failures in forms.
  if (
    requiredAction === "view" &&
    (menuDoc.isLookup || menuDoc.scope === "tenant")
  ) {
    return next();
  }

  // 7. READ-ONLY ENFORCEMENT
  const readOnlyMenus = ["auditlog", "workflowlog"];
  if (readOnlyMenus.includes(menuDoc.menuId) && requiredAction !== "view") {
    throw new ApiError(
      403,
      `Access Denied: ${menuDoc.menuId} is a strictly read-only module.`,
    );
  }

  // 8. ROLE-BASED ACCESS CONTROL (RBAC)
  // For 'Add', 'Edit', 'Delete', or non-lookup 'View', check specific role permissions.
  // Find if this specific menu is assigned to the user's active role
  const menuAccess = (user.activeRole.menus || []).find((m) => {
    const mId = typeof m.menuId === "object" ? m.menuId._id : m.menuId;
    return mId?.toString() === menuDoc._id.toString();
  });

  if (!menuAccess) {
    if (user.activeRole?.roleCode === "ADMIN" || user.isSuperAdmin)
      return next();
    throw new ApiError(
      403,
      `Access Denied: No permissions defined for '${menuDoc.description}'`,
    );
  }

  // Super Admins and Admins have all permissions even if the menu is assigned with restricted ones
  if (user.activeRole?.roleCode === "ADMIN" || user.isSuperAdmin) {
    return next();
  }

  const assignedPermissions = (menuAccess.permissions || []).map((p) =>
    p.toLowerCase(),
  );
  const targetAction = requiredAction.toLowerCase();

  // Check hierarchy: Does any assigned permission imply the required action?
  const implyingPermissions = HIERARCHY[targetAction] || [targetAction, "all"];
  const hasAccess = assignedPermissions.some((p) =>
    implyingPermissions.includes(p),
  );

  if (!hasAccess) {
    throw new ApiError(
      403,
      `Access Denied: You do not have '${requiredAction}' permission for '${menuDoc.description}'`,
    );
  }

  next();
});

/**
 * Legacy checkPermission (Manual) - kept for specialized cases
 */
export const checkPermission = (menuIdCode, requiredAction) => {
  return (req, res, next) => {
    // Re-use the hierarchy logic if needed manually
    next();
  };
};
