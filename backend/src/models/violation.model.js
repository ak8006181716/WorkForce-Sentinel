import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: [true, 'Worker reference is required'],
    },
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: [true, 'Site reference is required'],
    },
    ppeType: {
      type: String,
      enum: {
        values: ['HELMET', 'VEST', 'GLOVES', 'SAFETY_GLASSES', 'BOOTS', 'HARNESS'],
        message: '{VALUE} is not a recognized PPE type',
      },
      required: [true, 'PPE violation type is required'],
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACKNOWLEDGED', 'ESCALATED'],
      default: 'PENDING',
      required: true,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    escalatedToAdminAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

violationSchema.index({ status: 1, timestamp: 1 });
violationSchema.index({ siteId: 1, timestamp: -1 });
violationSchema.index({ ppeType: 1, timestamp: -1 });
violationSchema.index({ workerId: 1, timestamp: -1 });

export default mongoose.model('Violation', violationSchema);
