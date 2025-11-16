import { createUser, getUserProfile, loginUser, refreshAccessToken } from "../services/user.service.js";
import ApiResponse from "../utils/api-response.js";

export const registerUserHandler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await createUser({ name, email, password });
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
    return res.status(201).json(new ApiResponse(201, userData, 'User registered successfully'));
  } catch (error) {
    next(error)
  }
}

export const loginUserHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUser({ email, password });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      access_token: accessToken,
      refresh_token: refreshToken
    }

    return res.status(200).json(new ApiResponse(200, userData, 'User logged in successfully'));
  } catch (error) {
    next(error)
  }
}

export const getProfileHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await getUserProfile(userId);
    return res.status(200).json(new ApiResponse(200, user, 'User profile fetched successfully'));
  } catch (error) {
    next(error)
  }
}

export const refreshAccessTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const { accessToken, newRefreshToken } = await refreshAccessToken(refreshToken);

    return res.status(200).json(new ApiResponse(200, { access_token: accessToken, refresh_token: newRefreshToken }, 'Access token refreshed successfully'));
  } catch (error) {
    next(error)
  }
}
