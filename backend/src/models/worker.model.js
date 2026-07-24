import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Worker name is required'],
      trim: true,
    },
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: [true, 'Site assignment is required'],
    },
    iotDeviceId: {
      type: String,
      required: [true, 'IoT Device ID is required'],
      unique: true,
      trim: true,
    },
    jobProfile: {
      type: String,
      trim: true,
      default: 'Field Operator',
    },
    trade: {
      type: String,
      trim: true,
      default: 'GENERAL_CONSTRUCTION',
    },
    department: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    aadharNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

workerSchema.index({ siteId: 1 });

export default mongoose.model('Worker', workerSchema);
