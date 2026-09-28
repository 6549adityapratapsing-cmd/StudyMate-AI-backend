import PDFService from '../services/pdfService.js';
import OCRService from '../services/ocrService.js';
import TextCleanerService from '../services/textCleanerService.js';
import MaterialModel from '../models/materialModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const MaterialController = {
  /**
   * @route   POST /api/materials/upload
   * @desc    Upload and process study material (PDF, Image OCR, or Pasted Text)
   * @access  Private (Requires JWT)
   */
  async uploadMaterial(req, res, next) {
    try {
      const { title, isQuestionPaper, academicYear, subjectId, text } = req.body;
      const file = req.file;

      if (!file && (!text || !text.trim())) {
        return errorResponse(
          res,
          400,
          'Please provide a document file (PDF/Image) or paste your study notes text.'
        );
      }

      let rawText = '';
      let fileType = 'text';
      let pageCount = 1;
      let originalFilename = null;

      // 1. Process File Upload
      if (file) {
        originalFilename = file.originalname;

        if (file.mimetype === 'application/pdf') {
          fileType = 'pdf';
          const pdfResult = await PDFService.extractText(file.buffer);
          rawText = pdfResult.rawText;
          pageCount = pdfResult.pageCount;
        } else if (file.mimetype.startsWith('image/')) {
          fileType = 'image';
          const ocrResult = await OCRService.extractTextFromImage(file.buffer);
          rawText = ocrResult.rawText;
        } else if (file.mimetype === 'text/plain') {
          fileType = 'text';
          rawText = file.buffer.toString('utf-8');
        } else {
          return errorResponse(res, 400, 'Unsupported file format. Please upload PDF, PNG, JPG or TXT.');
        }
      } else {
        // Direct pasted text
        fileType = 'text';
        rawText = text;
      }

      // 2. Clean and Normalize Content
      const cleanedText = TextCleanerService.cleanText(rawText);

      if (!cleanedText || cleanedText.length < 10) {
        return errorResponse(
          res,
          400,
          'Extracted content is too short or empty. Please ensure the document contains readable study material.'
        );
      }

      // 3. Compute Stats
      const stats = TextCleanerService.calculateStats(cleanedText);

      // 4. Save to Database
      const finalTitle = title && title.trim() ? title.trim() : (originalFilename || 'Untitled Study Material');

      const material = await MaterialModel.create({
        userId: req.user.id,
        subjectId: subjectId || null,
        title: finalTitle,
        fileType,
        originalFilename,
        rawText,
        cleanedText,
        pageCount,
        isQuestionPaper: isQuestionPaper === 'true' || isQuestionPaper === true,
        academicYear: academicYear || null,
      });

      return successResponse(res, 201, 'Study material processed and saved successfully!', {
        material,
        stats,
      });
    } catch (err) {
      console.error('❌ [MaterialController.uploadMaterial Error]:', err.message);
      return errorResponse(res, 500, err.message || 'Failed to process study material.');
    }
  },

  /**
   * @route   GET /api/materials
   * @desc    List all study materials for logged-in student
   * @access  Private
   */
  async listMaterials(req, res, next) {
    try {
      const materials = await MaterialModel.findByUserId(req.user.id);
      return successResponse(res, 200, 'Study materials retrieved successfully.', {
        materials,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/materials/:id
   * @desc    Get detailed material by ID
   * @access  Private
   */
  async getMaterialById(req, res, next) {
    try {
      const material = await MaterialModel.findById(req.params.id, req.user.id);
      if (!material) {
        return errorResponse(res, 404, 'Study material not found.');
      }

      const stats = TextCleanerService.calculateStats(material.cleaned_text);

      return successResponse(res, 200, 'Material details retrieved.', {
        material,
        stats,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   DELETE /api/materials/:id
   * @desc    Delete study material
   * @access  Private
   */
  async deleteMaterial(req, res, next) {
    try {
      const deleted = await MaterialModel.deleteById(req.params.id, req.user.id);
      if (!deleted) {
        return errorResponse(res, 404, 'Study material not found or already deleted.');
      }
      return successResponse(res, 200, 'Study material deleted successfully.');
    } catch (err) {
      next(err);
    }
  },
};

export default MaterialController;
