import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/database.js';
import { initializeDatabase } from './utils/db.js';
import { errorHandler } from './middleware/auth.js';
import userRoutes from './routes/userRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Real Estate API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Real Estate Management System API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      properties: '/api/properties',
      inquiries: '/api/inquiries'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();

    app.listen(config.port, config.host, () => {
      console.log(`✓ Server running on http://${config.host}:${config.port}`);
      console.log(`✓ API Documentation: http://${config.host}:${config.port}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
