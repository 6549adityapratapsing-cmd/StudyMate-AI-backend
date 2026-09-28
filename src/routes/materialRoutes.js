import express from 'express';
import MaterialController from '../controllers/materialController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/materials/upload
 * @desc    Upload document (PDF/Image) or submit text
 */
router.post('/upload', requireAuth, upload.single('file'), MaterialController.uploadMaterial);

/**
 * @route   GET /api/materials
 * @desc    List all student study materials
 */
router.get('/', requireAuth, MaterialController.listMaterials);

/**
 * @route   GET /api/materials/:id
 * @desc    Get material details and extracted text
 */
router.get('/:id', requireAuth, MaterialController.getMaterialById);

/**
 * @route   DELETE /api/materials/:id
 * @desc    Delete study material
 */
router.delete('/:id', requireAuth, MaterialController.deleteMaterial);

export default router;
