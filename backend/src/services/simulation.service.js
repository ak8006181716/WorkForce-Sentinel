import Worker from '../models/worker.model.js';
import Violation from '../models/violation.model.js';

class SimulationService {
  static async generateRandomViolation(options = {}) {
    try {
      const workers = await Worker.find({ status: 'ACTIVE' });
      if (!workers || workers.length === 0) return null;

      const worker = workers[Math.floor(Math.random() * workers.length)];
      const ppeTypes = ['HELMET', 'VEST', 'GLOVES', 'SAFETY_GLASSES', 'BOOTS', 'HARNESS'];
      const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

      const notesList = [
        'Hardhat unequipped near high-risk area',
        'Safety vest missing during shift operation',
        'No protective gloves while handling sharp materials',
        'Eye protection missing during grinding work',
        'Safety harness unhooked on scaffolding',
        'Steel-toe boots missing in active work bay',
      ];

      const ppeType = options.ppeType || ppeTypes[Math.floor(Math.random() * ppeTypes.length)];
      const severity = options.severity || severities[Math.floor(Math.random() * severities.length)];
      const timestamp = options.timestamp ? new Date(options.timestamp) : new Date();
      const notes = options.notes || notesList[Math.floor(Math.random() * notesList.length)];

      const violation = await Violation.create({
        workerId: worker._id,
        siteId: worker.siteId,
        ppeType,
        severity,
        timestamp,
        status: options.status || 'PENDING',
        notes,
      });

      console.log(`[IoT Event] Violation created: ${ppeType} for ${worker.name}`);
      return violation;
    } catch (error) {
      console.error('Simulation error:', error.message);
      throw error;
    }
  }
}

export default SimulationService;
