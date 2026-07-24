import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Site name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Site code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Site location is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Site', siteSchema);
