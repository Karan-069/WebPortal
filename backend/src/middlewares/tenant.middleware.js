import {
  identifyTenant,
  getTenantConnection,
} from "../config/connectionManager.js";
import { getTenantModels } from "../models/tenantModels.js";
import { tenantStorage } from "../utils/tenantContext.js";
import logger from "../utils/logger.js";

/**
 * Middleware to identify the tenant and provide a Scoped Context (the "Private Desk").
 * It attaches models to both 'req.models' (legacy) and AsyncLocalStorage (modern wrapper).
 */
export const tenantMiddleware = async (req, res, next) => {
  try {
    const hostname = req.hostname || req.get("host");
    const headerTenantId = req.get("X-Tenant-Id");

    // 1. Identification: Header takes priority if provided, otherwise Subdomain
    const tenantId = await identifyTenant(hostname, headerTenantId);

    // 2. Resolve database connection and models
    let connection = null;
    let models = {};

    if (tenantId) {
      connection = await getTenantConnection(tenantId);
      models = getTenantModels(connection);
      logger.info(
        `✅ [TenantContext] Scoped: ${hostname} -> DB: ${connection.name}`,
      );
    } else {
      logger.warn(
        `⚠️ [TenantContext] Unscoped: ${hostname} (Header: ${headerTenantId || "none"})`,
      );
    }

    // 3. Attach to Request object for backward compatibility
    req.tenantId = tenantId;
    req.models = models;

    // 4. Guaranteed Scoped Context (the "Private Desk")
    // Note: We use an empty models object if no tenantId was found to avoid crashes in useModels() destructuring.
    tenantStorage.run({ models, tenantId }, () => {
      next();
    });
  } catch (error) {
    logger.error(`❌ Tenant Middleware Error: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message:
        "An error occurred while establishing client-specific data isolation.",
    });
  }
};
