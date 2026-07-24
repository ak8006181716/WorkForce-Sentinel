import Violation from '../models/violation.model.js';

class EscalationService {
  static async checkAndEscalateViolations() {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      const result = await Violation.updateMany(
        {
          status: 'PENDING',
          timestamp: { $lte: tenMinutesAgo },
        },
        {
          $set: {
            status: 'ESCALATED',
            escalatedToAdminAt: new Date(),
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Escalation] Auto-escalated ${result.modifiedCount} unacknowledged violation(s) to admin.`);
      }

      return result.modifiedCount;
    } catch (error) {
      console.error('Escalation error:', error.message);
      return 0;
    }
  }
}

export default EscalationService;
