import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config({ path: "./.env" });

async function checkRoles() {
    const connectionUrl = `${process.env.MONGODB_URI}/${process.env.DB_NAME || "WebPortal"}`;
    await mongoose.connect(connectionUrl);
    
    const UserRole = mongoose.model("UserRole", new mongoose.Schema({}, { strict: false }));
    const WorkflowRole = mongoose.model("WorkflowRole", new mongoose.Schema({}, { strict: false }));
    
    const roles = await UserRole.find({}).lean();
    console.log("User Roles:");
    roles.forEach(r => console.log(`ID: ${r._id}, Code: ${r.roleCode}, Description: ${r.description}`));
    
    const wfRoles = await WorkflowRole.find({}).lean();
    console.log("\nWorkflow Roles:");
    wfRoles.forEach(r => console.log(`ID: ${r._id}, Name: ${r.roleName}, Code: ${r.wfRoleCode}`));
    
    await mongoose.disconnect();
}

checkRoles().catch(console.error);
