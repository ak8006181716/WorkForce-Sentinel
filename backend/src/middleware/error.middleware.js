import ApiError from '../utils/apiError.js';
import config from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (error.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ID format`);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    error = ApiError.conflict(`An account with this ${field} already exists`);
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    error = ApiError.badRequest(messages.join(', '));
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Session expired or invalid token');
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server error',
    ...(config.env === 'development' && { stack: error.stack }),
  });
};

export default errorHandler;
