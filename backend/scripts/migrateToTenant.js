import mongoose from "mongoose";
import dotenv from "dotenv";
import { Client } from "../src/models/admin/client.model.js";
import { User } from "../src/models/user.model.js";
import { Vendor } from "../src/models/vendor.model.js";
import { Item } from "../src/models/item.model.js";
import { Department } from "../src/models/department.model.js";
import { Subsidary } from "../src/models/subsidary.model.js";
import { AssetCategory } from "../src/models/assetCategory.model.js";
import { Workflow } from "../src/models/workflow.model.js";
import { AppMenu } from "../src/models/appMenu.model.js";
import { UserRole } from "../src/models/userRole.model.js";
import { City } from "../src/models/city.model.js";
import { State } from "../src/models/state.model.js";
import { Crterm } from "../src/models/crterm.model.js";
import { Uom } from "../src/models/uom.model.js";
import { WorkflowRole } from "../src/models/workflowRole.model.js";
import { WorkflowState } from "../src/models/workflowState.model.js";

dotenv.config();

/**
 * Migration Script: Transfers monolithic business data to a target tenant database.
 * Usage: node scripts/migrateToTenant.js <tenant_slug>
 */

const MONGO_URI = process.env.MONGODB_URI;
const MAIN_DB = process.env.DB_NAME || "WebPortal";

const migrate = async () => {
    const slug = process.argv[2] || "default";
    console.log(`🚀 Starting migration for tenant: ${slug}...`);

    try {
        // 1. Connect to Main Admin Database
        await mongoose.connect(`${MONGO_URI}/${MAIN_DB}`);
        console.log("✅ Connected to Main Admin Database.");

        // 2. Fetch Client Info
        const client = await Client.findOne({ slug });
        if (!client) {
            console.error(`❌ Client with slug '${slug}' not found! Create one first.`);
            process.exit(1);
        }

        // 3. Define target connection
        const tenantDbName = `tenant_${client._id}`;
        const tenantConn = mongoose.createConnection(`${MONGO_URI}/${tenantDbName}`);
        
        console.log(`📡 Target Tenant Database: ${tenantDbName}`);

        // 4. List of collections to migrate
        const modelsToMigrate = [
            { name: "User", schema: User.schema },
            { name: "Vendor", schema: Vendor.schema },
            { name: "Item", schema: Item.schema },
            { name: "Department", schema: Department.schema },
            { name: "Subsidary", schema: Subsidary.schema },
            { name: "AssetCategory", schema: AssetCategory.schema },
            { name: "Workflow", schema: Workflow.schema },
            { name: "AppMenu", schema: AppMenu.schema },
            { name: "UserRole", schema: UserRole.schema },
            { name: "City", schema: City.schema },
            { name: "State", schema: State.schema },
            { name: "Crterm", schema: Crterm.schema },
            { name: "Uom", schema: Uom.schema },
            { name: "WorkflowRole", schema: WorkflowRole.schema },
            { name: "WorkflowState", schema: WorkflowState.schema }
        ];

        for (const meta of modelsToMigrate) {
            console.log(`📦 Registering ${meta.name} on target...`);
            const TargetModel = tenantConn.model(meta.name, meta.schema);
            const SourceModel = mongoose.model(meta.name);

            const data = await SourceModel.find({});
            if (data.length > 0) {
                console.log(`🔹 Migrating ${data.length} records for ${meta.name}...`);
                await TargetModel.deleteMany({}); // Clean start
                await TargetModel.insertMany(data);
                console.log(`✅ ${meta.name} Migration Complete.`);
            } else {
                console.log(`⏭️ No records found for ${meta.name}. Skipping.`);
            }
        }

        console.log("\n✨ MIGRATION SUCCESSFUL! All business data moved to tenant isolation.");
        process.exit(0);

    } catch (error) {
        console.error("💥 Migration Failed:", error);
        process.exit(1);
    }
};

migrate();
