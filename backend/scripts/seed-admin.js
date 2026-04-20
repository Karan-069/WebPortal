/**
 * Admin Seed Script
 * -----------------
 * Creates (or updates) all entities required for an admin user:
 *   1. All AppMenus (idempotent upsert by menuId)
 *   2. Admin WorkflowRole
 *   3. Admin Department
 *   4. Admin UserRole  (linked to ALL existing AppMenus with "all" permissions)
 *   5. Admin User
 *
 * Usage:  node scripts/seed-admin.js
 * Run from: backend/ directory
 */

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ─── Models ────────────────────────────────────────────────────────────────
import { User } from "../src/models/user.model.js";
import { UserRole } from "../src/models/userRole.model.js";
import { WorkflowRole } from "../src/models/workflowRole.model.js";
import { Department } from "../src/models/department.model.js";
import { AppMenu } from "../src/models/appMenu.model.js";
import DashboardConfig from "../src/models/DashboardConfig.model.js";

// ─── Admin Credentials ─────────────────────────────────────────────────────
const ADMIN = {
  email: "systemadmin@webportal.com",
  password: "Admin@123",
  fullName: "System Administrator",
  accessType: "user",
};

// ─── Complete Menu Definitions ─────────────────────────────────────────────
// Each entry: { menuId, description, parentMenuId (menuId string or null), sortOrder, icon, menuLevel, menuType, permissions }
const MENU_DEFINITIONS = [
  // ── Root-level items ──
  { menuId: "dashboard",      description: "Dashboard",          parentMenuId: null,              sortOrder: 1,   icon: "dashboard",    menuLevel: 0, menuType: "page",   permissions: ["view", "all"] },
  { menuId: "masters",        description: "Masters",            parentMenuId: null,              sortOrder: 2,   icon: "layers",       menuLevel: 0, menuType: "folder", permissions: ["view", "all"] },
  { menuId: "transactions",   description: "Transactions",       parentMenuId: null,              sortOrder: 3,   icon: "receipt",      menuLevel: 0, menuType: "folder", permissions: ["view", "all"] },
  { menuId: "administration", description: "Administration",     parentMenuId: null,              sortOrder: 4,   icon: "usercog",      menuLevel: 0, menuType: "folder", permissions: ["view", "all"] },

  // ── Masters children ──
  { menuId: "department",     description: "Departments",        parentMenuId: "masters",         sortOrder: 1,   icon: "building",     menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "state",          description: "States",             parentMenuId: "masters",         sortOrder: 2,   icon: "globe",        menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "city",           description: "Cities",             parentMenuId: "masters",         sortOrder: 3,   icon: "mappin",       menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "uom",            description: "Units of Measure",   parentMenuId: "masters",         sortOrder: 4,   icon: "calculator",   menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "subsidary",      description: "Subsidiaries",       parentMenuId: "masters",         sortOrder: 5,   icon: "building",     menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "location",       description: "Locations",          parentMenuId: "masters",         sortOrder: 6,   icon: "mappin",       menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "crterm",         description: "Credit Terms",       parentMenuId: "masters",         sortOrder: 7,   icon: "creditcard",   menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "assetCategory",  description: "Asset Categories",   parentMenuId: "masters",         sortOrder: 8,   icon: "layers",       menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "item",           description: "Item Master",        parentMenuId: "masters",         sortOrder: 9,   icon: "box",          menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "submit", "approve", "view", "all"] },
  { menuId: "vendor",         description: "Vendors",            parentMenuId: "masters",         sortOrder: 10,  icon: "user",         menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "submit", "approve", "view", "all"] },
  { menuId: "asset",          description: "Physical Assets",    parentMenuId: "masters",         sortOrder: 11,  icon: "box",          menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },

  // ── Transactions children ──
  { menuId: "bills",          description: "Bill Management",    parentMenuId: "transactions",    sortOrder: 1,   icon: "receipt",      menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "submit", "approve", "view", "all"] },

  // ── Administration children ──
  { menuId: "userRole",       description: "System Roles",       parentMenuId: "administration",  sortOrder: 1,   icon: "shield",       menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "workflowRole",   description: "Workflow Roles",     parentMenuId: "administration",  sortOrder: 2,   icon: "shield",       menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "workflow",       description: "Workflows",          parentMenuId: "administration",  sortOrder: 3,   icon: "gauge",        menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "workflowLog",    description: "Audit Logs",         parentMenuId: "administration",  sortOrder: 4,   icon: "spreadsheet",  menuLevel: 1, menuType: "page",   permissions: ["view", "all"] },
  { menuId: "nextTransactionId", description: "Sequences",       parentMenuId: "administration",  sortOrder: 5,   icon: "spreadsheet",  menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "vendorInvite",   description: "Vendor Invites",     parentMenuId: "administration",  sortOrder: 6,   icon: "user",         menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "emailTemplate",  description: "Email Templates",    parentMenuId: "administration",  sortOrder: 7,   icon: "spreadsheet",  menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "feature",        description: "Feature Flags",      parentMenuId: "administration",  sortOrder: 8,   icon: "gauge",        menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "settings",       description: "Global Settings",    parentMenuId: "administration",  sortOrder: 9,   icon: "gauge",        menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "client",         description: "Clients",            parentMenuId: "administration",  sortOrder: 10,  icon: "building",     menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
  { menuId: "license",        description: "Licenses",           parentMenuId: "administration",  sortOrder: 11,  icon: "gauge",        menuLevel: 1, menuType: "page",   permissions: ["add", "edit", "view", "all"] },
];

// ─── Main ──────────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n🔗  Connecting to MongoDB…");
  await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME || "WebPortal"}`);
  console.log("✅  Connected\n");

  // ═══════════════════════════════════════════════════════════════════
  // Step 1: Upsert all AppMenus (idempotent — safe to re-run)
  // ═══════════════════════════════════════════════════════════════════
  console.log("── Step 1: Upsert AppMenus ──");

  // Drop legacy unique index on 'description' if it exists
  try {
    await AppMenu.collection.dropIndex("description_1");
    console.log("  🗑️  Dropped legacy unique index on 'description'");
  } catch (e) {
    // Index may not exist — that's fine
    if (e.codeName !== 'IndexNotFound') {
      console.log("  ℹ️  No legacy description index to drop");
    }
  }


  // First pass: upsert root-level menus (no parentMenu)
  const menuIdToObjectId = {};  // menuId string → MongoDB _id
  const rootMenus = MENU_DEFINITIONS.filter(m => m.parentMenuId === null);
  const childMenus = MENU_DEFINITIONS.filter(m => m.parentMenuId !== null);

  for (const def of rootMenus) {
    const doc = await AppMenu.findOneAndUpdate(
      { menuId: def.menuId },
      {
        menuId: def.menuId,
        description: def.description,
        sortOrder: def.sortOrder,
        icon: def.icon,
        menuLevel: def.menuLevel,
        menuType: def.menuType,
        permissions: def.permissions,
        isActive: true,
        parentMenu: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    menuIdToObjectId[def.menuId] = doc._id;
    console.log(`  ✔  ${def.menuId.padEnd(22)} → ${doc._id} (root)`);
  }

  // Second pass: upsert child menus (with parentMenu reference)
  for (const def of childMenus) {
    const parentObjectId = menuIdToObjectId[def.parentMenuId];
    if (!parentObjectId) {
      console.warn(`  ⚠  Skipping ${def.menuId} — parent '${def.parentMenuId}' not found`);
      continue;
    }

    const doc = await AppMenu.findOneAndUpdate(
      { menuId: def.menuId },
      {
        menuId: def.menuId,
        description: def.description,
        parentMenu: parentObjectId,
        sortOrder: def.sortOrder,
        icon: def.icon,
        menuLevel: def.menuLevel,
        menuType: def.menuType,
        permissions: def.permissions,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    menuIdToObjectId[def.menuId] = doc._id;
    console.log(`  ✔  ${def.menuId.padEnd(22)} → ${doc._id} (child of ${def.parentMenuId})`);
  }

  console.log(`\n📋  Total menus upserted: ${Object.keys(menuIdToObjectId).length}`);

  // ═══════════════════════════════════════════════════════════════════
  // Step 2: Build admin role menu entries from ALL active menus
  // ═══════════════════════════════════════════════════════════════════
  const allMenus = await AppMenu.find({ isActive: true }).lean();
  console.log(`📋  Found ${allMenus.length} active menus in DB`);

  const menuEntries = allMenus.map((m) => ({
    menuId: m._id,
    permissions: ["all"],
  }));

  // ═══════════════════════════════════════════════════════════════════
  // Step 3: Admin WorkflowRole
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n── Step 2: WorkflowRole ──");
  let wfRole = await WorkflowRole.findOne({ wfRoleCode: "ADMIN_WF" });
  if (wfRole) {
    console.log(`  ✔  WorkflowRole (ADMIN_WF) already exists  →  ${wfRole._id}`);
  } else {
    wfRole = await WorkflowRole.create({
      wfRoleCode: "ADMIN_WF",
      description: "Admin Workflow Role",
      wfRoleType: ["admin", "approve", "submit"],
      isActive: true,
    });
    console.log(`  ✚  WorkflowRole (ADMIN_WF) created          →  ${wfRole._id}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // Step 4: Admin Department
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n── Step 3: Department ──");
  let department = await Department.findOne({ deptCode: "ADMIN_DEPT" });
  if (department) {
    console.log(`  ✔  Department (ADMIN_DEPT) already exists  →  ${department._id}`);
  } else {
    department = await Department.create({
      deptCode: "ADMIN_DEPT",
      description: "Administration",
      isActive: true,
    });
    console.log(`  ✚  Department (ADMIN_DEPT) created          →  ${department._id}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // Step 5: Admin UserRole — always refresh menus list
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n── Step 4: UserRole ──");
  let userRole = await UserRole.findOne({ roleCode: "ADMIN" });
  if (userRole) {
    userRole.menus = menuEntries;
    await userRole.save();
    console.log(`  ✔  UserRole (ADMIN) already exists  →  ${userRole._id}  [menus refreshed: ${menuEntries.length}]`);
  } else {
    userRole = await UserRole.create({
      roleCode: "ADMIN",
      description: "System Administrator — full access",
      menus: menuEntries,
      isActive: true,
    });
    console.log(`  ✚  UserRole (ADMIN) created          →  ${userRole._id}  [menus: ${menuEntries.length}]`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // Step 6: Admin User
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n── Step 5: Admin User ──");
  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    // Fix existing user's role fields if they are empty
    let needsSave = false;
    if (!existing.userRoles || existing.userRoles.length === 0) {
      existing.userRoles = [userRole._id];
      needsSave = true;
    }
    if (!existing.workflowRoles || existing.workflowRoles.length === 0) {
      existing.workflowRoles = [wfRole._id];
      needsSave = true;
    }
    if (!existing.defaultRole) {
      existing.defaultRole = userRole._id;
      needsSave = true;
    }
    if (!existing.activeRole) {
      existing.activeRole = userRole._id;
      needsSave = true;
    }
    if (!existing.defaultWorkflowRole) {
      existing.defaultWorkflowRole = wfRole._id;
      needsSave = true;
    }
    if (!existing.activeWorkflowRole) {
      existing.activeWorkflowRole = wfRole._id;
      needsSave = true;
    }
    if (needsSave) {
      await existing.save({ validateBeforeSave: false });
      console.log(`  🔧  User roles fixed for  →  ${existing._id}  (${ADMIN.email})`);
    } else {
      console.log(`  ✔  User already exists  →  ${existing._id}  (${ADMIN.email})`);
    }
    console.log("     Password unchanged. Delete and re-run to reset.");
  } else {
    await User.create({
      email: ADMIN.email,
      password: ADMIN.password,
      fullName: ADMIN.fullName,
      userRoles: [userRole._id],
      workflowRoles: [wfRole._id],
      defaultRole: userRole._id,
      activeRole: userRole._id,
      defaultWorkflowRole: wfRole._id,
      activeWorkflowRole: wfRole._id,
      department: department._id,
      accessType: ADMIN.accessType,
      isActive: true,
    });
    console.log(`  ✚  Admin user created  →  ${ADMIN.email}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // Step 7: Default Dashboard Configurations
  // ═══════════════════════════════════════════════════════════════════
  console.log("\n── Step 7: Dashboard Configurations ──");
  
  const dashboardRoles = [
    {
      roleName: 'admin',
      layout: [
        { id: 'admin-total-bills', title: 'Total Bills', apiEndpoint: '/dashboard/metrics/admin-total-bills', clickRoute: '/bills', icon: 'Database', colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50', order: 1 },
        { id: 'admin-total-users', title: 'Active Users', apiEndpoint: '/dashboard/metrics/admin-total-users', clickRoute: '/users', icon: 'Users', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50', order: 2 },
        { id: 'admin-total-vendors', title: 'Registered Vendors', apiEndpoint: '/dashboard/metrics/admin-total-vendors', clickRoute: '/vendors', icon: 'Building', colorClass: 'text-sky-600', bgClass: 'bg-sky-50', order: 3 },
      ]
    },
    {
      roleName: 'approver',
      layout: [
        { id: 'approver-pending', title: 'Pending My Action', apiEndpoint: '/dashboard/metrics/approver-pending', clickRoute: '/bills', icon: 'AlertCircle', colorClass: 'text-amber-600', bgClass: 'bg-amber-50', order: 1 },
        { id: 'approver-approved-total', title: 'Total Approved', apiEndpoint: '/dashboard/metrics/approver-approved-total', clickRoute: '/bills', icon: 'CheckCircle2', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50', order: 2 },
      ]
    },
    {
      roleName: 'vendor',
      layout: [
        { id: 'vendor-invoices', title: 'Invoices Uploaded', apiEndpoint: '/dashboard/metrics/vendor-invoices', clickRoute: '/bills', icon: 'Receipt', colorClass: 'text-sky-600', bgClass: 'bg-sky-50', order: 1 },
        { id: 'vendor-approved', title: 'Approved for Payment', apiEndpoint: '/dashboard/metrics/vendor-approved', clickRoute: '/bills', icon: 'CheckCircle2', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50', order: 2 },
        { id: 'vendor-rejected', title: 'Requires Rework', apiEndpoint: '/dashboard/metrics/vendor-rejected', clickRoute: '/bills', icon: 'XCircle', colorClass: 'text-red-500', bgClass: 'bg-red-50', order: 3 },
      ]
    },
    {
      roleName: 'user',
      layout: [
        { id: 'user-drafts', title: 'My Drafts', apiEndpoint: '/dashboard/metrics/user-drafts', clickRoute: '/bills', icon: 'FileSpreadsheet', colorClass: 'text-slate-600', bgClass: 'bg-slate-50', order: 1 },
        { id: 'user-submitted', title: 'My Submissions', apiEndpoint: '/dashboard/metrics/user-submitted', clickRoute: '/bills', icon: 'Send', colorClass: 'text-sky-600', bgClass: 'bg-sky-50', order: 2 },
      ]
    },
    {
      roleName: 'default',
      layout: [
        { id: 'admin-total-bills', title: 'Total Bills', apiEndpoint: '/dashboard/metrics/admin-total-bills', clickRoute: '/bills', icon: 'Receipt', colorClass: 'text-sky-600', bgClass: 'bg-sky-50', order: 1 }
      ]
    }
  ];

  for (const conf of dashboardRoles) {
    const doc = await DashboardConfig.findOneAndUpdate(
      { roleName: conf.roleName },
      { layout: conf.layout },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  ✔  Dashboard layout established for [${conf.roleName}]`);
  }


  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║        ADMIN CREDENTIALS               ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║  Email    : ${ADMIN.email.padEnd(28)}║`);
  console.log(`║  Password : ${ADMIN.password.padEnd(28)}║`);
  console.log(`║  Role     : ADMIN (all menus)          ║`);
  console.log(`║  Menus    : ${String(menuEntries.length).padEnd(28)}║`);
  console.log("╚════════════════════════════════════════╝\n");

  await mongoose.disconnect();
  console.log("🔌  Disconnected. Seed complete!\n");
}

seed().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
