import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error.js';
import { User } from '../models/index.js';
import NotFoundError from '../errors/not-found-error.js';
import ForbiddenError from '../errors/forbidden-error.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      throw new UnauthorizedError("Access token is missing")
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
      throw new UnauthorizedError("Invalid access token")
    }

    const user = await User.findByPk(decoded.id, decoded?.reg_id, {
      attributes: { exclude: ['password', 'refresh_token'] }
    })

    if (!user) throw new NotFoundError("User not found")

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export function authorizeAdmin(req, res, next) {
  const user = req.user;
  if (!user) throw new UnauthorizedError("User not authenticated");
  if (req.user.role !== 'ADMIN') throw new ForbiddenError("Admin privileges required");
  next();
}