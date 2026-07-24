import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import ApiError from '../utils/apiError.js';
import User from '../models/user.model.js';

/**
 * Authenticate JWT Security Bearer Token Middleware
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Access denied. Authentication token missing.'));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Verify user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(ApiError.unauthorized('The user belonging to this token no longer exists.'));
    }

    if (!user.isActive) {
      return next(ApiError.unauthorized('User account has been deactivated. Please contact an admin.'));
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};
