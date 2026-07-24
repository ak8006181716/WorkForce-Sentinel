import Violation from '../models/violation.model.js';
import ApiError from '../utils/apiError.js';
import exportToCSV from '../utils/csvExporter.js';

class SupervisorService {
  /**
   * Supervisor Dashboard Metrics (Today's, Pending, Acknowledged)
   */
  static async getDashboardMetrics(user) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const siteFilter = user.role === 'SUPERVISOR' && user.siteId ? { siteId: user.siteId } : {};

    const [todaysCount, pendingCount, acknowledgedCount] = await Promise.all([
      Violation.countDocuments({ ...siteFilter, timestamp: { $gte: startOfToday } }),
      Violation.countDocuments({ ...siteFilter, status: 'PENDING' }),
      Violation.countDocuments({ ...siteFilter, status: 'ACKNOWLEDGED' }),
    ]);

    return {
      todaysViolations: todaysCount,
      pendingViolations: pendingCount,
      acknowledgedViolations: acknowledgedCount,
    };
  }

  /**
   * Get violations list with filtering, search, and pagination
   */
  static async getViolations({ page = 1, limit = 10, search = '', siteId = '', ppeType = '', status = '' }, user) {
    const query = {};

    // If supervisor is tied to specific site and no override requested
    if (user.role === 'SUPERVISOR' && user.siteId) {
      query.siteId = user.siteId;
    } else if (siteId) {
      query.siteId = siteId;
    }

    if (ppeType) query.ppeType = ppeType;
    if (status) query.status = status;

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
      {
        $lookup: {
          from: 'users',
          localField: 'acknowledgedBy',
          foreignField: '_id',
          as: 'acknowledgedByUser',
        },
      },
      {
        $unwind: {
          path: '$acknowledgedByUser',
          preserveNullAndEmptyArrays: true,
        },
      },
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

    const [violationsResult, countResult] = await Promise.all([
      Violation.aggregate(dataPipeline),
      Violation.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
      violations: violationsResult,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit) || 1,
      },
    };
  }

  /**
   * Acknowledge a PPE violation
   */
  static async acknowledgeViolation(violationId, user, notes = '') {
    const violation = await Violation.findById(violationId);
    if (!violation) {
      throw ApiError.notFound('PPE Violation record not found.');
    }

    if (violation.status === 'ACKNOWLEDGED') {
      throw ApiError.badRequest('Violation has already been acknowledged.');
    }

    violation.status = 'ACKNOWLEDGED';
    violation.acknowledgedBy = user._id;
    violation.acknowledgedAt = new Date();
    if (notes) violation.notes = notes;

    await violation.save();

    return Violation.findById(violationId)
      .populate('workerId', 'name employeeId trade jobProfile department mobileNumber iotDeviceId')
      .populate('siteId', 'name code location')
      .populate('acknowledgedBy', 'name email');
  }

  /**
   * Generate CSV export data for supervisor/admin reports
   */
  static async exportViolationsCSV({ startDate, endDate, siteId, status }, user) {
    const query = {};

    if (user.role === 'SUPERVISOR' && user.siteId) {
      query.siteId = user.siteId;
    } else if (siteId) {
      query.siteId = siteId;
    }

    if (status) query.status = status;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const violations = await Violation.find(query)
      .populate('workerId', 'name employeeId trade jobProfile department mobileNumber iotDeviceId')
      .populate('siteId', 'name code location')
      .populate('acknowledgedBy', 'name email')
      .sort({ timestamp: -1 });

    const formattedData = violations.map((v) => ({
      Violation_ID: v._id.toString(),
      Worker_Name: v.workerId ? v.workerId.name : 'N/A',
      Employee_ID: v.workerId ? v.workerId.employeeId : 'N/A',
      Job_Profile: v.workerId ? v.workerId.jobProfile || v.workerId.trade : 'N/A',
      Department: v.workerId ? v.workerId.department || 'Operations' : 'N/A',
      Mobile_Number: v.workerId ? v.workerId.mobileNumber || 'N/A' : 'N/A',
      IoT_Device_ID: v.workerId ? v.workerId.iotDeviceId : 'N/A',
      Site_Name: v.siteId ? v.siteId.name : 'N/A',
      PPE_Type: v.ppeType,
      Severity: v.severity,
      Status: v.status,
      Timestamp: new Date(v.timestamp).toISOString(),
      Acknowledged_By: v.acknowledgedBy ? v.acknowledgedBy.name : 'Unacknowledged',
      Acknowledged_At: v.acknowledgedAt ? new Date(v.acknowledgedAt).toISOString() : 'N/A',
      Escalated_To_Admin_At: v.escalatedToAdminAt ? new Date(v.escalatedToAdminAt).toISOString() : 'N/A',
      Notes: v.notes || '',
    }));

    const fields = [
      'Violation_ID',
      'Worker_Name',
      'Employee_ID',
      'Job_Profile',
      'Department',
      'Mobile_Number',
      'IoT_Device_ID',
      'Site_Name',
      'PPE_Type',
      'Severity',
      'Status',
      'Timestamp',
      'Acknowledged_By',
      'Acknowledged_At',
      'Escalated_To_Admin_At',
      'Notes',
    ];

    return exportToCSV(formattedData, fields);
  }
}

export default SupervisorService;
