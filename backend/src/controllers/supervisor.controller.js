import SupervisorService from '../services/supervisor.service.js';
import ApiResponse from '../utils/apiResponse.js';

class SupervisorController {
  static async getDashboard(req, res, next) {
    try {
      const data = await SupervisorService.getDashboardMetrics(req.user);
      return ApiResponse.success(res, data, 'Supervisor dashboard metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getViolations(req, res, next) {
    try {
      const result = await SupervisorService.getViolations(req.query, req.user);
      return ApiResponse.success(res, result, 'Violations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async acknowledgeViolation(req, res, next) {
    try {
      const { notes } = req.body;
      const updated = await SupervisorService.acknowledgeViolation(req.params.id, req.user, notes);
      return ApiResponse.success(res, updated, 'Violation acknowledged successfully');
    } catch (error) {
      next(error);
    }
  }

  static async exportReport(req, res, next) {
    try {
      const csvData = await SupervisorService.exportViolationsCSV(req.query, req.user);
      const fileName = `ppe_violations_report_${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

export default SupervisorController;
