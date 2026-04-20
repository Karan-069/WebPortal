import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config({ path: "./.env" });

async function checkData() {
    const connectionUrl = `${process.env.MONGODB_URI}/${process.env.DB_NAME || "WebPortal"}`;
    await mongoose.connect(connectionUrl);
    
    const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
    const UserRole = mongoose.model("UserRole", new mongoose.Schema({}, { strict: false }));
    
    const users = await User.find({}).lean();
    console.log("Total Users:", users.length);
    users.forEach(u => {
        console.log(`User: ${u.email}, activeRole: ${u.activeRole}, defaultRole: ${u.defaultRole}, userRoles: ${u.userRoles?.length || 0}`);
    });
    
    const roles = await UserRole.find({}).lean();
    console.log("\nTotal Roles:", roles.length);
    roles.forEach(r => {
        console.log(`Role: ${r.roleCode}, Menus: ${r.menus?.length || 0}`);
    });
    
    await mongoose.disconnect();
}

checkData().catch(console.error);
