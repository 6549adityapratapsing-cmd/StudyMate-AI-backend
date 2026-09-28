import express from 'express';
import AIController from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All AI study engine endpoints require authenticated student session
router.use(requireAuth);

/**
 * @route   POST /api/ai/quick-summary
 * @desc    Generate high-yield quick summary
 */
router.post('/quick-summary', AIController.getQuickSummary);

/**
 * @route   POST /api/ai/detailed-summary
 * @desc    Generate organized chapter revision breakdown
 */
router.post('/detailed-summary', AIController.getDetailedSummary);

/**
 * @route   POST /api/ai/key-points
 * @desc    Extract key concepts, definitions & formulas
 */
router.post('/key-points', AIController.getKeyPoints);

/**
 * @route   POST /api/ai/explain
 * @desc    Explain a specific concept simply with analogies
 */
router.post('/explain', AIController.explainConcept);

/**
 * @route   POST /api/ai/important-questions
 * @desc    Generate important questions categorized by exam priority
 */
router.post('/important-questions', AIController.getImportantQuestions);

export default router;
