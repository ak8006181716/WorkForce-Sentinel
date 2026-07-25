import AdminService from '../services/admin.service.js';
import ApiResponse from '../utils/apiResponse.js';

class AdminController {
  static async getDashboard(req, res, next) {
    try {
      const data = await AdminService.getDashboardMetrics();
      return ApiResponse.success(res, data, 'Admin dashboard metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getSupervisors(req, res, next) {
    try {
      const result = await AdminService.getSupervisors(req.query);
      return ApiResponse.success(res, result, 'Supervisors retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createSupervisor(req, res, next) {
    try {
      const supervisor = await AdminService.createSupervisor(req.body);
      return ApiResponse.created(res, supervisor, 'Supervisor created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateSupervisor(req, res, next) {
    try {
      const supervisor = await AdminService.updateSupervisor(req.params.id, req.body);
      return ApiResponse.success(res, supervisor, 'Supervisor updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteSupervisor(req, res, next) {
    try {
      const result = await AdminService.deleteSupervisor(req.params.id);
      return ApiResponse.success(res, result, 'Supervisor deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAlerts(req, res, next) {
    try {
      const result = await AdminService.getEscalatedAlerts(req.query);
      return ApiResponse.success(res, result, 'Escalated admin alerts retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getInsights(req, res, next) {
    try {
      const insights = await AdminService.getInsights();
      return ApiResponse.success(res, insights, 'Data insights and analytics retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;
