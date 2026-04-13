import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Generate Access & Refresh Tokens
 */
const generateTokensService = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Login User
 */
const loginUserService = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User is inactive");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const tokens = await generateTokensService(user);

  const safeUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  return {
    user: safeUser,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

/**
 * Refresh Access Token
 */
const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
  } catch (error) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  const user = await User.findById(decoded._id);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User inactive");
  }

  if (user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Refresh token expired");
  }

  const tokens = await generateTokensService(user);

  return tokens;
};

export { generateTokensService, loginUserService, refreshAccessTokenService };
