import express from 'express';
import { successResponse } from '../utils/apiResponse.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check route to verify backend is up and running
 * @access  Public
 */
router.get('/', (req, res) => {
  return successResponse(res, 200, 'StudyMate AI Backend API is running smoothly', {
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    version: '1.0.0'
  });
});

export default router;
