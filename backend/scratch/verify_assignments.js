import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config({ path: "./.env" });

import { User } from "../src/models/user.model.js";
import { UserRole } from "../src/models/userRole.model.js";
import { WorkflowRole } from "../src/models/workflowRole.model.js";

async function verify() {
    const connectionUrl = `${process.env.MONGODB_URI}/${process.env.DB_NAME || "WebPortal"}`;
    await mongoose.connect(connectionUrl);
    
    const admin = await User.findOne({ email: 'admin@webportal.com' }).populate('roleAssignments.userRole roleAssignments.workflowRole defaultRoleAssignment.userRole defaultRoleAssignment.workflowRole');
    
    console.log("Admin Data Verification:");
    console.log("Email:", admin.email);
    console.log("Default Assignment:", admin.defaultRoleAssignment ? `${admin.defaultRoleAssignment.userRole?.roleCode} paired with ${admin.defaultRoleAssignment.workflowRole?.wfRoleCode}` : 'None');
    console.log("Assignments Count:", admin.roleAssignments.length);
    console.log("Assignments:", admin.roleAssignments.map(a => `${a.userRole?.roleCode} -> ${a.workflowRole?.wfRoleCode}`).join(', '));
    
    await mongoose.disconnect();
}

verify();
