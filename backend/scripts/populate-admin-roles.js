/**
 * Data Maintenance Script: Populate Admin Roles
 * --------------------------------------------
 * Assigns ALL active UserRoles and WorkflowRoles to admin@webportal.com
 */

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { UserRole } from "../src/models/userRole.model.js";
import { WorkflowRole } from "../src/models/workflowRole.model.js";

async function populateAdmin() {
  console.log("\n🔗  Connecting to MongoDB…");
  const connectionUrl = `${process.env.MONGODB_URI}/${process.env.DB_NAME || "WebPortal"}`;
  await mongoose.connect(connectionUrl);
  console.log("✅  Connected\n");

  // 1. Fetch all active roles
  const [uRoles, wRoles] = await Promise.all([
    UserRole.find({ isActive: true }).lean(),
    WorkflowRole.find({ isActive: true }).lean()
  ]);

  console.log(`📋  Found ${uRoles.length} User Roles and ${wRoles.length} Workflow Roles.`);

  const adminUser = await User.findOne({ email: 'admin@webportal.com' });
  if (!adminUser) {
    console.error("❌  Admin user not found!");
    await mongoose.disconnect();
    return;
  }

  // 2. Prepare Assignments
  const adminWfRole = wRoles.find(r => r.wfRoleCode === 'ADMIN_WF');
  const roleAssignments = [];
  const assignedUserRoles = [];
  const assignedWorkflowRoles = wRoles.map(r => r._id);

  for (const uRole of uRoles) {
    assignedUserRoles.push(uRole._id);
    
    // Try to find a logical match
    let pairedWf = wRoles.find(w => 
      w.wfRoleCode === `${uRole.roleCode}_WF` || 
      w.wfRoleCode === uRole.roleCode ||
      (uRole.roleCode === 'ADMIN' && w.wfRoleCode === 'ADMIN_WF')
    );

    // Fallback to ADMIN_WF or first available
    if (!pairedWf) pairedWf = adminWfRole || wRoles[0];

    if (pairedWf) {
      roleAssignments.push({
        userRole: uRole._id,
        workflowRole: pairedWf._id
      });
    }
  }

  // 3. Update Admin
  adminUser.userRoles = assignedUserRoles;
  adminUser.workflowRoles = assignedWorkflowRoles;
  adminUser.roleAssignments = roleAssignments;

  // Set the default to ADMIN -> ADMIN_WF if possible
  const adminPair = roleAssignments.find(a => {
      const u = uRoles.find(ur => ur._id.toString() === a.userRole.toString());
      return u && u.roleCode === 'ADMIN';
  });
  
  if (adminPair) {
    adminUser.defaultRoleAssignment = adminPair;
    adminUser.activeRole = adminPair.userRole;
    adminUser.activeWorkflowRole = adminPair.workflowRole;
  } else if (roleAssignments.length > 0) {
    adminUser.defaultRoleAssignment = roleAssignments[0];
    adminUser.activeRole = roleAssignments[0].userRole;
    adminUser.activeWorkflowRole = roleAssignments[0].workflowRole;
  }

  await adminUser.save({ validateBeforeSave: false });

  console.log(`✨  Successfully populated roles for admin@webportal.com`);
  console.log(`📊  Total Assignments: ${roleAssignments.length}`);
  console.log(`📊  Total User Roles: ${assignedUserRoles.length}`);

  await mongoose.disconnect();
}

populateAdmin().catch((err) => {
  console.error("\n❌  Population failed:", err.message);
  process.exit(1);
});
