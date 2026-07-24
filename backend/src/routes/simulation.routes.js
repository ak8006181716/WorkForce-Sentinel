import express from 'express';
import SimulationController from '../controllers/simulation.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Protected route for simulation triggers
router.use(protect);
router.use(authorize('ADMIN', 'SUPERVISOR'));

router.post('/trigger', SimulationController.triggerViolation);
router.post('/escalate-now', SimulationController.forceEscalationCheck);

export default router;
