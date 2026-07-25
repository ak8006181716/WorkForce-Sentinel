import SimulationService from '../services/simulation.service.js';
import EscalationService from '../services/escalation.service.js';
import ApiResponse from '../utils/apiResponse.js';

class SimulationController {
  /**
   * POST /api/simulation/trigger
   * Trigger single mock IoT violation creation
   */
  static async triggerViolation(req, res, next) {
    try {
      const { ppeType, severity, ageInMinutes, status } = req.body;

      let customOptions = { ppeType, severity, status };

      // If user wants to simulate an old unacknowledged violation (e.g. 15 mins ago to test escalation instantly)
      if (ageInMinutes) {
        customOptions.timestamp = new Date(Date.now() - parseInt(ageInMinutes, 10) * 60 * 1000);
      }

      const violation = await SimulationService.generateRandomViolation(customOptions);
      return ApiResponse.created(res, violation, 'Mock IoT PPE Violation generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/simulation/escalate-now
   * Force trigger 10-minute escalation check now
   */
  static async forceEscalationCheck(req, res, next) {
    try {
      const count = await EscalationService.checkAndEscalateViolations();
      return ApiResponse.success(res, { escalatedCount: count }, `Escalation engine check completed. ${count} violation(s) escalated.`);
    } catch (error) {
      next(error);
    }
  }
}

export default SimulationController;
