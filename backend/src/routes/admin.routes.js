import express from 'express';
import AdminController from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Apply auth and role protection across all admin routes
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/supervisors', AdminController.getSupervisors);
router.post('/supervisors', AdminController.createSupervisor);
router.put('/supervisors/:id', AdminController.updateSupervisor);
router.delete('/supervisors/:id', AdminController.deleteSupervisor);

router.get('/alerts', AdminController.getAlerts);
router.get('/insights', AdminController.getInsights);

export default router;
