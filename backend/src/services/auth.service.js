import User from '../models/user.model.js';
import ApiError from '../utils/apiError.js';

class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(email, password) {
    if (!email || !password) {
      throw ApiError.badRequest('Please provide both email address and password');
    }

    // Explicitly select password field as it's excluded by default schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('siteId', 'name code location');

    if (!user) {
      throw ApiError.unauthorized('Invalid email address or password');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated. Please contact administrator.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email address or password');
    }

    const token = user.generateAuthToken();

    // Prepare user DTO without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      siteId: user.siteId,
      createdAt: user.createdAt,
    };

    return { token, user: userResponse };
  }

  /**
   * Fetch current authenticated user details
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId).populate('siteId', 'name code location');
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }
    return user;
  }
}

export default AuthService;
