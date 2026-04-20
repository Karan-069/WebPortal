/**
 * Data Migration Script: Grouped Role Assignments
 * --------------------------------------------
 * 1. Pairs existing UserRoles with WorkflowRoles.
 * 2. Initializes defaultRoleAssignment.
 * 3. Ensures every user has valid activeRole and activeWorkflowRole.
 * 4. Cleans up legacy default fields.
 */

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { UserRole } from "../src/models/userRole.model.js";
import { WorkflowRole } from "../src/models/workflowRole.model.js";

// Helper to check if role models are available (needed for looking up codes)
async function getRoleMappings() {
  const UserRole = mongoose.model("UserRole");
  const WorkflowRole = mongoose.model("WorkflowRole");

  const [uRoles, wRoles] = await Promise.all([
    UserRole.find({ isActive: true }).lean(),
    WorkflowRole.find({ isActive: true }).lean()
  ]);

  return { uRoles, wRoles };
}

async function migrate() {
  console.log("\n🔗  Connecting to MongoDB…");
  const connectionUrl = `${process.env.MONGODB_URI}/${process.env.DB_NAME || "WebPortal"}`;
  await mongoose.connect(connectionUrl);
  console.log("✅  Connected\n");

  // Ensure Role models are registered (sometimes lazy loading issues in scripts)
  const { uRoles, wRoles } = await getRoleMappings();
  
  const adminRole = uRoles.find(r => r.roleCode === 'ADMIN');
  const adminWfRole = wRoles.find(r => r.wfRoleCode === 'ADMIN_WF');

  console.log(`🔍  Role Lookup: ADMIN: ${adminRole?._id}, ADMIN_WF: ${adminWfRole?._id}`);

  const users = await User.find({});
  console.log(`📋  Processing ${users.length} users…\n`);

  let fixCount = 0;

  for (const user of users) {
    let modified = false;

    // 1. Explicitly Fix Administrative Users
    if (user.email === 'admin@webportal.com' || user.email === 'systemadmin@webportal.com') {
      if (adminRole && adminWfRole) {
        user.roleAssignments = [{ userRole: adminRole._id, workflowRole: adminWfRole._id }];
        user.defaultRoleAssignment = user.roleAssignments[0];
        
        // Ensure legacy fields are also valid for compatibility
        user.userRoles = [adminRole._id];
        user.workflowRoles = [adminWfRole._id];
        user.activeRole = adminRole._id;
        user.activeWorkflowRole = adminWfRole._id;
        
        console.log(`  ✔  Hard-reset ADMIN assignments for [${user.email}]`);
        modified = true;
      }
    } else {
      // 2. Heal others only if needed
      let needsHeal = !user.roleAssignments || user.roleAssignments.length === 0;
      if (!needsHeal) {
          needsHeal = user.roleAssignments.some(a => !a.workflowRole || !a.userRole);
      }

      if (needsHeal) {
        const assignments = [];
        if (user.userRoles && user.userRoles.length > 0) {
          const uId = user.userRoles[0];
          const wId = (user.workflowRoles && user.workflowRoles.length > 0) 
                       ? user.workflowRoles[0] 
                       : adminWfRole?._id;
          
          if (uId && wId) {
            assignments.push({ userRole: uId, workflowRole: wId });
            console.log(`  ✔  Healing assignments for [${user.email}]`);
            modified = true;
          }
        }
        
        if (assignments.length > 0) {
          user.roleAssignments = assignments;
          if (!user.defaultRoleAssignment || !user.defaultRoleAssignment.userRole) {
            user.defaultRoleAssignment = assignments[0];
          }
          if (!user.activeRole) user.activeRole = assignments[0].userRole;
          if (!user.activeWorkflowRole) user.activeWorkflowRole = assignments[0].workflowRole;
          modified = true;
        }
      }
    }

    if (modified) {
      try {
        await user.save({ validateBeforeSave: false });
        fixCount++;
      } catch (err) {
        console.error(`  ❌  Failed to save [${user.email}]:`, err.message);
      }
    }
  }

  console.log(`\n✨  Migration Complete!`);
  console.log(`📊  Users Updated:  ${fixCount}`);
  console.log(`📊  Total Scanned:  ${users.length}\n`);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("\n❌  Migration failed:", err.message);
  process.exit(1);
});
