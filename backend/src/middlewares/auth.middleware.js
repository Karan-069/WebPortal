import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    //Getting Cookie from User
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Handling Error if Token not being Found
    if (!token) {
      throw new ApiError(401, "UnAuthorization Request !!");
    }

    // Unwrapping User using Cookie
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    //Getting User from DB
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invaild Access Token !!");
    }

    //Setting user data in middleware
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token !!");
  }
});

export { verifyJWT };
