import jwt from 'jsonwebtoken';
import ApiError from '../errors/api-error.js';

export const generateAccessToken = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  }

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
  });

  return accessToken;
}

export const generateRefreshToken = async (user) => {
  const payload = {
    id: user.id,
  }

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  });

  return refreshToken
}

export const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    return decoded;
  } catch (error) {
    throw new ApiError('Invalid refresh token');
  }
}