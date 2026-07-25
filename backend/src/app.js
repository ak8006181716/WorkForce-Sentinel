import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/env.js';
import apiRoutes from './routes/index.js';
import errorHandler from './middleware/error.middleware.js';
import ApiError from './utils/apiError.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Request rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Catch 404 routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot find ${req.originalUrl} on this server`));
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
