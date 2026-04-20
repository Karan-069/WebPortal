import { AsyncLocalStorage } from "node:async_hooks";

/**
 * AsyncLocalStorage instance to maintain tenant-specific context (models, tenantId)
 * across asynchronous operations within a single request.
 *
 * This is our "Private Request Desk".
 */
const tenantStorage = new AsyncLocalStorage();

/**
 * Helper to get the models for the current request's tenant.
 * Can be used in any service or utility without passing parameters.
 */
export const useModels = () => {
  const store = tenantStorage.getStore();
  return store?.models;
};

/**
 * Helper to get the current tenant ID.
 */
export const useTenantId = () => {
  const store = tenantStorage.getStore();
  return store?.tenantId;
};

export const useUserId = () => {
  const store = tenantStorage.getStore();
  return store?.userId;
};

export { tenantStorage };
