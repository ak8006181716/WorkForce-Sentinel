import AuthService from '../services/auth.service.js';
import ApiResponse from '../utils/apiResponse.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await AuthService.login(email, password);
    return ApiResponse.success(res, data, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return ApiResponse.success(res, null, 'Logged out');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getCurrentUser(req.user._id);
    return ApiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};
