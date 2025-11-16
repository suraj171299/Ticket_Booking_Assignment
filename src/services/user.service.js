import bcrypt from 'bcryptjs';
import { sequelize, User } from '../models/index.js';
import BadRequestError from '../errors/bad-request-error.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token-util.js';
import NotFoundError from '../errors/not-found-error.js';
import UnauthorizedError from '../errors/unauthorized-error.js';

export async function createUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new BadRequestError('Name, email and password are required to create a user');
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    throw new BadRequestError('A user with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role: 'USER' });
  return user;
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new BadRequestError('Email and password are required to login');
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new BadRequestError('Invalid email or password');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError('Invalid email or password');
  }

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  await user.update({ refresh_token: refreshToken })

  return { user, accessToken, refreshToken };
}

export async function getUserProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'refresh_token'] }
  });
  if (!user) {
    throw new BadRequestError('User not found');
  }
  return user;
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new BadRequestError('Refresh token is required');
  }

  const decoded = await verifyRefreshToken(refreshToken);

  const user = await User.findByPk(decoded?.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }
  if (refreshToken !== user.refresh_token) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const accessToken = await generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user);

  await user.update({ refresh_token: newRefreshToken });

  return { accessToken, newRefreshToken };
}
