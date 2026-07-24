import ApiError from '../utils/apiError.js';

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * @param  {...string} allowedRoles Roles allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User identity unverified. Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`)
      );
    }

    next();
  };
};
