import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workforce_management',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  escalationCheckIntervalMs: parseInt(process.env.ESCALATION_CHECK_INTERVAL_MS || '30000', 10),
  simulationIntervalMs: parseInt(process.env.SIMULATION_INTERVAL_MS || '15000', 10),
};
