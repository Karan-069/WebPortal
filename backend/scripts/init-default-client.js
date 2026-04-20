import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import { Client } from "../src/models/admin/client.model.js";

const DEFAULT_SLUG = "default";
const DEFAULT_DB = process.env.DB_NAME || "WebPortal";

async function initialize() {
  console.log("🚀 Initializing Default Tenant Registry...");
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI is not defined in .env");

    // Connect to the Admin Database
    await mongoose.connect(`${mongoUri}/WebPortal`);
    console.log("✅ Connected to Administrative Database (WebPortal)");

    // Upsert the Primary Client
    const existing = await Client.findOne({ slug: DEFAULT_SLUG });
    
    if (existing) {
      console.log(`ℹ️  Default client already exists (ID: ${existing._id}). Updating...`);
      existing.dbName = DEFAULT_DB;
      existing.isActive = true;
      await existing.save();
    } else {
      const created = await Client.create({
        name: "Primary Organization",
        slug: DEFAULT_SLUG,
        dbName: DEFAULT_DB,
        isActive: true
      });
      console.log(`✚  Default client created (ID: ${created._id})`);
    }

    console.log(`✨ DONE: Requests from localhost will now resolve to the '${DEFAULT_DB}' database.`);
  } catch (error) {
    console.error("❌ Initialization Failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

initialize();
