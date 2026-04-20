import mongoose from 'mongoose';
import { updateCrtermService, getCrtermsService } from '../src/services/crterm.service.js';
import { useModels, tenantStorage } from '../src/utils/tenantContext.js';
import { getTenantConnection } from '../src/config/connectionManager.js';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    const uriObj = new URL(dbUri);
    uriObj.pathname = "/webportal_default";
    const fullUri = uriObj.toString();
    await mongoose.connect(fullUri);
    console.log("Connected to MongoDB.");
    
    // We need a userId. Let's find one.
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const u = await User.findOne({});
    if (!u) {
      console.log("No user found.");
      return;
    }
    const userId = u._id;

    await tenantStorage.run({ tenantId: 'default', models: require('../src/models/tenantModels.js').getModelsForTenant(mongoose.connection), userId }, async () => {
      const { Crterm, AuditLog } = useModels();
      
      const crterm = await Crterm.findOne({});
      if (!crterm) {
        console.log("No crterms found to test.");
        process.exit(1);
      }
      
      console.log("Updating crterm:", crterm.termCode);
      const newDays = crterm.days === 30 ? 45 : 30;
      
      await updateCrtermService(crterm.termCode, { days: newDays });
      console.log("Update executed.");
      
      const logs = await AuditLog.find({ recordId: crterm._id }).sort({ timestamp: -1 }).limit(1);
      console.log("Audit logs found for this record:", logs.length);
      if (logs.length) console.log("LATEST LOG:", JSON.stringify(logs[0], null, 2));
    });
    
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit(0);
  }
};

runTest();
