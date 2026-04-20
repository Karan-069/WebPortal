import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

import { getUserWithAccess } from "../services/user.service.js";
import { refreshAccessTokenService } from "../services/auth.service.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  // Token from cookies or Authorization header
  // VERBOSE LOGGING FOR DIAGNOSTICS
  console.log(`[AuthMW] Request: ${req.method} ${req.originalUrl}`);

  // Explicitly bypass verification for public auth routes
  const publicPaths = ["/api/v1/users/login", "/api/v1/users/refresh-token"];
  const isPublic = publicPaths.some((path) => req.originalUrl === path);

  if (isPublic) {
    console.log(`[AuthMW] Bypassing auth for public route: ${req.originalUrl}`);
    return next();
  }
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  console.log("Cookies:", req.cookies);
  console.log("Authorization:", req.header("Authorization"));
  if (!accessToken) {
    throw new ApiError(
      401,
      `Unauthorized Request to ${req.originalUrl} token not provided`,
    );
  }

  // Detect external API
  const isExternalAPI = !!req.header("Authorization");

  try {
    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET_KEY);

    const user = await getUserWithAccess(decoded._id);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;

    // Inject User ID into Scoped Context for Audit Tracking
    const { tenantStorage } = await import("../utils/tenantContext.js");
    const store = tenantStorage.getStore();
    if (store) {
      store.userId = user._id;
    }

    return next();
  } catch (error) {
    // If external API → do not refresh
    if (isExternalAPI) {
      throw new ApiError(401, "Token Expired or Invalid");
    }

    // If not expired → reject
    if (error.name !== "TokenExpiredError") {
      throw new ApiError(401, "Invalid Token");
    }

    // Internal App Refresh Logic
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      };
      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);
      throw new ApiError(401, "Session Expired, Please Login Again");
    }

    // Generate new tokens
    const tokens = await refreshAccessTokenService(refreshToken);

    // Set new cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    res.cookie("accessToken", tokens.accessToken, cookieOptions);
    res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

    // Decode new access token
    const decoded = jwt.verify(
      tokens.accessToken,
      process.env.JWT_ACCESS_SECRET_KEY,
    );

    const user = await getUserWithAccess(decoded._id);

    if (!user) {
      throw new ApiError(401, "Invalid Session");
    }

    req.user = user;

    return next();
  }
});

export { verifyJWT };

/* import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

import { getUserWithAccess } from "../services/user.service.js";
import { refreshAccessTokenService } from "../services/auth.service.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    let accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized Request");
    }

    try {
      // verify access token
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET_KEY,
      );

      const user = await getUserWithAccess(decoded._id);

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user;
      return next();
    } catch (error) {
      // token expired
      if (error.name === "TokenExpiredError") {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          throw new ApiError(401, "Session Expired, Please Login Again");
        }

        // generate new tokens
        const tokens = await refreshAccessTokenService(refreshToken);

        // set new cookies
        res.cookie("accessToken", tokens.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
        });

        res.cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
        });

        // decode new token
        const decoded = jwt.verify(
          tokens.accessToken,
          process.env.JWT_ACCESS_SECRET_KEY,
        );

        const user = await getUserWithAccess(decoded._id);

        if (!user) {
          throw new ApiError(401, "Invalid Session");
        }

        req.user = user;

        return next();
      }

      throw error;
    }
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export { verifyJWT };
*/
