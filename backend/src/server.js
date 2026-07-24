import app from './app.js';
import connectDB from './config/db.js';
import config from './config/env.js';
import EscalationService from './services/escalation.service.js';
import SimulationService from './services/simulation.service.js';

await connectDB();

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);

  // Background escalation check (every 30s)
  setInterval(() => {
    EscalationService.checkAndEscalateViolations();
  }, config.escalationCheckIntervalMs);

  // Background IoT simulation stream (every 15s)
  setInterval(() => {
    SimulationService.generateRandomViolation().catch(() => {});
  }, config.simulationIntervalMs);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the existing process or change PORT in .env.`);
    process.exit(1);
  }
  console.error('Server error:', error);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
