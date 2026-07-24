import express from 'express';
import SupervisorController from '../controllers/supervisor.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Apply auth and role protection (SUPERVISOR and ADMIN can both access supervisor endpoints)
router.use(protect);
router.use(authorize('SUPERVISOR', 'ADMIN'));

router.get('/dashboard', SupervisorController.getDashboard);
router.get('/violations', SupervisorController.getViolations);
router.patch('/violations/:id/acknowledge', SupervisorController.acknowledgeViolation);
router.get('/reports/export', SupervisorController.exportReport);

export default router;
