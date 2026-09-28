import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS (Cross-Origin Resource Sharing) - Allows all origins & domains
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all incoming origins (localhost, Vercel, Render, custom domains, mobile apps, Postman)
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200,
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Simple Request Logger for Development
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`📡 [${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'StudyMate AI Backend API',
    status: 'active',
    documentation: 'Refer to /api/health for system status',
  });
});

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/ai', aiRoutes);

// Fallback Middleware: 404 Not Found & Global Error Handler
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
