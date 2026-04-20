/**
 * Token Service - Decoupled JWT generation and session management
 */
export const generateTokensService = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Persist the refresh token to the user document
    user.refreshToken = refreshToken;

    // Perform an atomic save. We use validateBeforeSave: false
    // because role switching might happen in a state that doesn't
    // strictly fulfill all schema requirements (e.g. temporary missing fields).
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("TOKEN_SERVICE_ERROR:", error);
    throw error;
  }
};
