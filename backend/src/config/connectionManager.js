import mongoose from "mongoose";
import { Client } from "../models/admin/client.model.js";

/**
 * Connection pool to cache tenant database connections.
 * Key: clientId, Value: connectionInstance
 */
const connectionPool = new Map();

/**
 * Gets or creates a connection for a specific tenant.
 * Uses the primary connection's tunnel via .useDb() for efficiency and SSL stability.
 */
export const getTenantConnection = async (clientId) => {
  // 1. Check local cache first
  if (connectionPool.has(clientId)) {
    return connectionPool.get(clientId);
  }

  // 2. Resolve client from Admin Registry
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error(
      `Client ${clientId} not found in the administrative registry.`,
    );
  }

  // 3. Switch database context on the primary connection
  // { useCache: true } ensures that models are reused correctly for the same DB name
  const tenantConnection = mongoose.connection.useDb(client.dbName, {
    useCache: true,
  });

  console.log(`🚀 Switched context to Client DB: ${client.dbName}`);

  // Cache the database instance
  connectionPool.set(clientId, tenantConnection);

  return tenantConnection;
};

/**
 * Helper to identify tenant from hostname/subdomain or explicit header.
 */
export const identifyTenant = async (hostname, tenantIdHeader) => {
  // 1. Priority: Explicit Tenant ID Header (e.g. from localStorage/Session)
  if (tenantIdHeader && mongoose.Types.ObjectId.isValid(tenantIdHeader)) {
    console.log(
      `🔍 [TenantContext] Identifying via Header ID: ${tenantIdHeader}`,
    );
    return tenantIdHeader;
  }

  if (!hostname) return null;

  const parts = hostname.split(".");
  let slug = null;

  // 2. Subdomain check (e.g. client1.webportal.com or client1.localhost)
  if (parts.length >= (hostname.includes("localhost") ? 2 : 3)) {
    slug = parts[0].toLowerCase();
  } else {
    // 3. Default Fallback
    slug = "default";
  }

  // Avoid common non-tenant subdomains
  if (["www", "admin", "api", "mail"].includes(slug)) {
    slug = "default";
  }

  console.log(
    `🔍 [TenantContext] Identifying via Slug: '${slug}' (Host: ${hostname})`,
  );

  const client = await Client.findOne({ slug, isActive: true });

  if (!client) {
    console.log(
      `⚠️ [TenantContext] Registry lookup failed for slug: '${slug}'`,
    );
    return null;
  }

  console.log(
    `✅ [TenantContext] Resolved Slug: '${slug}' -> DB: '${client.dbName}'`,
  );
  return client._id;
};
