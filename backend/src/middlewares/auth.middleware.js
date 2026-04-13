import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

import { getUserWithAccess } from "../services/user.service.js";
import { refreshAccessTokenService } from "../services/auth.service.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  // Token from cookies or Authorization header
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized Request");
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
      throw new ApiError(401, "Session Expired, Please Login Again");
    }

    // Generate new tokens
    const tokens = await refreshAccessTokenService(refreshToken);

    // Set new cookies
    const cookieOptions = {
      httpOnly: true,
      secure: true,
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
