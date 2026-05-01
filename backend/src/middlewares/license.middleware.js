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

  // 3. Count existing users in the TENANT isolated database by type
  const { accessType } = req.body;
  const targetType = accessType || "user"; // Default to internal user if not specified

  const currentUserCount = await models.User.countDocuments({
    accessType: targetType,
  });

  // 4. Enforce granular limits
  if (targetType === "user") {
    if (currentUserCount >= license.maxCoreUsers) {
      throw new ApiError(
        403,
        `Core User limit reached (${license.maxCoreUsers}). Please upgrade your license to add more team members.`,
      );
    }
  } else if (targetType === "vendor") {
    if (currentUserCount >= license.maxVendorUsers) {
      throw new ApiError(
        403,
        `Vendor User limit reached (${license.maxVendorUsers}). Please upgrade your license to invite more vendor partners.`,
      );
    }
  }

  next();
});
