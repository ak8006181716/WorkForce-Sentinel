import express from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import supervisorRoutes from './supervisor.routes.js';
import simulationRoutes from './simulation.routes.js';
import Site from '../models/site.model.js';
import Worker from '../models/worker.model.js';
import { protect } from '../middleware/auth.middleware.js';
import ApiResponse from '../utils/apiResponse.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/supervisor', supervisorRoutes);
router.use('/simulation', simulationRoutes);

// Public/Protected Utility endpoints for Dropdowns (Sites & Workers)
router.get('/sites', protect, async (req, res, next) => {
  try {
    const sites = await Site.find({ isActive: true }).select('name code location');
    return ApiResponse.success(res, sites, 'Active sites retrieved');
  } catch (err) {
    next(err);
  }
});

router.get('/workers', protect, async (req, res, next) => {
  try {
    const { siteId } = req.query;
    const query = { status: 'ACTIVE' };
    if (siteId) query.siteId = siteId;

    const workers = await Worker.find(query).populate('siteId', 'name code').select('name employeeId iotDeviceId trade siteId');
    return ApiResponse.success(res, workers, 'Active workers retrieved');
  } catch (err) {
    next(err);
  }
});

export default router;
