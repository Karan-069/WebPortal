/**
 * Permission Hierarchy Logic
 *
 * Defines which high-level permissions imply lower-level ones.
 * Example: 'edit' automatically implies 'view'.
 */

const HIERARCHY = {
  // 'view' is implied by almost any other action
  view: ["view", "add", "edit", "delete", "all", "approve", "submit"],

  // 'add', 'edit', 'delete' are generally distinct but implied by 'all'
  add: ["add", "all"],
  edit: ["edit", "all"],
  delete: ["delete", "all"],

  // Workflow actions
  approve: ["approve", "all"],
  submit: ["submit", "all"],
};

/**
 * Checks if the user has the required permission based on a list of assigned permissions.
 * @param {string[]} assignedPermissions - Array of strings (e.g. ['edit', 'view'])
 * @param {string} requiredAction - The target action (e.g. 'view')
 * @returns {boolean}
 */
export const hasPermission = (assignedPermissions = [], requiredAction) => {
  if (!requiredAction) return true;
  if (!assignedPermissions || !Array.isArray(assignedPermissions)) return false;

  const normalizedAssigned = assignedPermissions.map((p) => p.toLowerCase());
  const normalizedRequired = requiredAction.toLowerCase();

  // If hierarchy rules exist for this action, check if any of the implying permissions exist
  const implyingPermissions = HIERARCHY[normalizedRequired] || [
    normalizedRequired,
    "all",
  ];

  return normalizedAssigned.some((p) => implyingPermissions.includes(p));
};

/**
 * Helper to get permissions for a specific menu slug/ID from the user object
 */
export const getMenuPermissions = (user, menuSlug) => {
  if (!user) return [];

  // Super Admins and Global Administrators always have full access
  if (user.isSuperAdmin || user.userRole?.roleCode === "ADMIN") {
    return ["all"];
  }

  if (!user.userRole || !user.userRole.menus) return [];

  const menuEntry = user.userRole.menus.find(
    (m) =>
      m.menuId?.menuId?.toLowerCase() === menuSlug?.toLowerCase() ||
      m.menuId?._id?.toString() === menuSlug,
  );

  return menuEntry?.permissions || [];
};
