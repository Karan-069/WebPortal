/**
 * Cleanup stale menus & verify menu list
 * Run: node scripts/cleanup-menus.js
 */
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
import { AppMenu } from "../src/models/appMenu.model.js";

// These are the ONLY valid menuIds we need
const VALID_MENU_IDS = new Set([
  "dashboard", "masters", "transactions", "administration",
  "department", "state", "city", "uom", "subsidary", "location",
  "crterm", "assetCategory", "item", "vendor", "asset",
  "bills",
  "userRole", "workflowRole", "workflow", "workflowLog",
  "nextTransactionId", "vendorInvite", "emailTemplate",
  "feature", "settings", "client", "license"
]);

async function cleanup() {
  console.log("\n🔗  Connecting...");
  await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME || "WebPortal"}`);
  console.log("✅  Connected\n");

  const allMenus = await AppMenu.find({}).lean();
  console.log(`📋  Total menus in DB: ${allMenus.length}`);
  console.log("\n── All Menus ──");
  for (const m of allMenus) {
    const isValid = VALID_MENU_IDS.has(m.menuId);
    const status = isValid ? "✅" : "❌ STALE";
    console.log(`  ${status}  ${m.menuId?.padEnd(25)} ${m.description?.padEnd(25)} active=${m.isActive}`);
  }

  const staleMenus = allMenus.filter(m => !VALID_MENU_IDS.has(m.menuId));
  console.log(`\n🗑️  Found ${staleMenus.length} stale menus to remove`);

  if (staleMenus.length > 0) {
    const staleIds = staleMenus.map(m => m._id);
    const result = await AppMenu.deleteMany({ _id: { $in: staleIds } });
    console.log(`  Deleted ${result.deletedCount} stale menus`);

    // Also remove stale menu references from all UserRoles
    const { UserRole } = await import("../src/models/userRole.model.js");
    const roles = await UserRole.find({});
    for (const role of roles) {
      const before = role.menus.length;
      role.menus = role.menus.filter(m => !staleIds.some(id => id.equals(m.menuId)));
      if (role.menus.length < before) {
        await role.save();
        console.log(`  Updated role ${role.roleCode}: ${before} → ${role.menus.length} menus`);
      }
    }
  }

  // Verify final state
  const remaining = await AppMenu.find({ isActive: true }).lean();
  console.log(`\n✅  Clean state: ${remaining.length} active menus remain`);

  await mongoose.disconnect();
  console.log("🔌  Done!\n");
}

cleanup().catch(err => {
  console.error("❌  Failed:", err.message);
  process.exit(1);
});
