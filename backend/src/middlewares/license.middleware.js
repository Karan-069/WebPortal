import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { License } from "../models/admin/license.model.js";

/**
 * Middleware to restrict user creation based on the client's subscribed license limits.
 * It checks the 'maxUsers' from the Shared Admin Database and compares it with
 * the count of existing users in the Tenant Database.
 */
export const licenseCheck = asyncHandler(async (req, res, next) => {
  const { tenantId, models } = req;

  if (!tenantId || !models || !models.User) {
    return next(); // Skip if not in a tenant context
  }

  // 1. Fetch the active license for this client from the Main Admin Database
  const license = await License.findOne({
    clientId: tenantId,
    isActive: true,
  });

  if (!license) {
    throw new ApiError(
      403,
      "No active license found for this organization. User creation is restricted.",
    );
  }

  // 2. Check for expiry
  if (license.expiryDate < new Date()) {
    throw new ApiError(
      403,
      "Your organization's license has expired. Please renew to add more users.",
    );
  }

  // 3. Count existing users in the TENANT isolated database
  const currentUserCount = await models.User.countDocuments();

  // 4. Enforce limit
  if (currentUserCount >= license.maxUsers) {
    throw new ApiError(
      403,
      `User limit reached (${license.maxUsers}). Please upgrade your license from the Master Settings to add more team members.`,
    );
  }

  next();
});
