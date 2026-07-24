import User from '../models/user.model.js';
import Worker from '../models/worker.model.js';
import Violation from '../models/violation.model.js';
import Site from '../models/site.model.js';
import ApiError from '../utils/apiError.js';

class AdminService {
  /**
   * Admin Dashboard Key Metrics
   */
  static async getDashboardMetrics() {
    const [totalWorkers, totalSupervisors, totalViolations, activeAlertsCount] = await Promise.all([
      Worker.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ role: 'SUPERVISOR', isActive: true }),
      Violation.countDocuments(),
      Violation.countDocuments({ status: 'ESCALATED' }),
    ]);

    return {
      totalWorkers,
      totalSupervisors,
      totalViolations,
      activeAlertsCount,
    };
  }

  /**
   * Supervisor CRUD - List with pagination & filtering
   */
  static async getSupervisors({ page = 1, limit = 10, search = '' }) {
    const query = { role: 'SUPERVISOR' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [supervisors, total] = await Promise.all([
      User.find(query)
        .populate('siteId', 'name code location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      User.countDocuments(query),
    ]);

    return {
      supervisors,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit) || 1,
      },
    };
  }

  /**
   * Supervisor CRUD - Create Supervisor
   */
  static async createSupervisor(data) {
    const { name, email, password, siteId } = data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict(`User with email '${email}' already exists.`);
    }

    if (siteId) {
      const siteExists = await Site.findById(siteId);
      if (!siteExists) {
        throw ApiError.notFound('Assigned site not found.');
      }
    }

    const supervisor = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'SUPERVISOR',
      siteId: siteId || null,
    });

    const populated = await User.findById(supervisor._id).populate('siteId', 'name code location');
    return populated;
  }

  /**
   * Supervisor CRUD - Update Supervisor
   */
  static async updateSupervisor(id, data) {
    const { name, email, siteId, isActive } = data;

    const supervisor = await User.findById(id);
    if (!supervisor || supervisor.role !== 'SUPERVISOR') {
      throw ApiError.notFound('Supervisor account not found.');
    }

    if (email && email.toLowerCase() !== supervisor.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        throw ApiError.conflict(`Email '${email}' is already used by another account.`);
      }
      supervisor.email = email.toLowerCase();
    }

    if (name) supervisor.name = name;
    if (siteId !== undefined) supervisor.siteId = siteId || null;
    if (isActive !== undefined) supervisor.isActive = isActive;

    await supervisor.save();
    return User.findById(id).populate('siteId', 'name code location');
  }

  /**
   * Supervisor CRUD - Delete Supervisor
   */
  static async deleteSupervisor(id) {
    const supervisor = await User.findById(id);
    if (!supervisor || supervisor.role !== 'SUPERVISOR') {
      throw ApiError.notFound('Supervisor account not found.');
    }

    await User.findByIdAndDelete(id);
    return { id };
  }

  /**
   * Admin Alerts Page (Escalated violations unacknowledged > 10 min)
   */
  static async getEscalatedAlerts({ page = 1, limit = 10, search = '', siteId = '' }) {
    const query = { status: 'ESCALATED' };

    if (siteId) {
      query.siteId = siteId;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'workers',
          localField: 'workerId',
          foreignField: '_id',
          as: 'worker',
        },
      },
      { $unwind: '$worker' },
      {
        $lookup: {
          from: 'sites',
          localField: 'siteId',
          foreignField: '_id',
          as: 'site',
        },
      },
      { $unwind: '$site' },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'worker.name': { $regex: search, $options: 'i' } },
            { 'worker.employeeId': { $regex: search, $options: 'i' } },
            { 'site.name': { $regex: search, $options: 'i' } },
            { ppeType: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const dataPipeline = [
      ...pipeline,
      { $sort: { timestamp: -1 } },
      { $skip: skip },
      { $limit: parsedLimit },
    ];

    const [alertsResult, countResult] = await Promise.all([
      Violation.aggregate(dataPipeline),
      Violation.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
      alerts: alertsResult,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit) || 1,
      },
    };
  }

  /**
   * Analytics & Data Insights Aggregation
   */
  static async getInsights() {
    // 1. Violations by Site
    const violationsBySite = await Violation.aggregate([
      {
        $group: {
          _id: '$siteId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'sites',
          localField: '_id',
          foreignField: '_id',
          as: 'site',
        },
      },
      { $unwind: '$site' },
      {
        $project: {
          siteName: '$site.name',
          siteCode: '$site.code',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 2. Violations by PPE Type
    const violationsByPPE = await Violation.aggregate([
      {
        $group: {
          _id: '$ppeType',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          ppeType: '$_id',
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Daily Violations (Last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyViolations = await Violation.aggregate([
      { $match: { timestamp: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          escalated: {
            $sum: { $cond: [{ $eq: ['$status', 'ESCALATED'] }, 1, 0] },
          },
          acknowledged: {
            $sum: { $cond: [{ $eq: ['$status', 'ACKNOWLEDGED'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          escalated: 1,
          acknowledged: 1,
          _id: 0,
        },
      },
    ]);

    // 4. Monthly Violations (Last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyViolations = await Violation.aggregate([
      { $match: { timestamp: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return {
      violationsBySite,
      violationsByPPE,
      dailyViolations,
      monthlyViolations,
    };
  }
}

export default AdminService;
