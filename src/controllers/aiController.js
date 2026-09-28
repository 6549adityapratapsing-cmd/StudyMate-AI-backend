import MaterialModel from '../models/materialModel.js';
import AIService from '../services/aiService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const AIController = {
  /**
   * Helper to retrieve material text by ID or from request body
   */
  async getMaterialText(req) {
    const { materialId, text, title } = req.body;

    if (materialId) {
      const material = await MaterialModel.findById(materialId, req.user.id);
      if (!material) {
        throw new Error('Study material not found or unauthorized.');
      }
      return {
        text: material.cleaned_text || material.raw_text,
        title: material.title,
        materialId: material.id,
      };
    }

    if (text && text.trim().length > 10) {
      return {
        text: text.trim(),
        title: title || 'Pasted Study Material',
        materialId: null,
      };
    }

    throw new Error('Please select a study material or provide text content to analyze.');
  },

  /**
   * @route   POST /api/ai/quick-summary
   */
  async getQuickSummary(req, res, next) {
    try {
      const { text, title } = await AIController.getMaterialText(req);
      const summary = await AIService.generateQuickSummary(text, title);

      return successResponse(res, 200, 'Quick summary generated successfully.', {
        summary,
      });
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  },

  /**
   * @route   POST /api/ai/detailed-summary
   */
  async getDetailedSummary(req, res, next) {
    try {
      const { text, title } = await AIController.getMaterialText(req);
      const detailedSummary = await AIService.generateDetailedSummary(text, title);

      return successResponse(res, 200, 'Detailed chapter summary generated.', {
        detailedSummary,
      });
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  },

  /**
   * @route   POST /api/ai/key-points
   */
  async getKeyPoints(req, res, next) {
    try {
      const { text, title } = await AIController.getMaterialText(req);
      const keyPointsData = await AIService.generateKeyPoints(text, title);

      return successResponse(res, 200, 'Key revision points extracted.', {
        ...keyPointsData,
      });
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  },

  /**
   * @route   POST /api/ai/explain
   */
  async explainConcept(req, res, next) {
    try {
      const { concept } = req.body;
      if (!concept || !concept.trim()) {
        return errorResponse(res, 400, 'Please provide a concept or topic to explain.');
      }

      const { text } = await AIController.getMaterialText(req);
      const explanation = await AIService.explainSimply(text, concept.trim());

      return successResponse(res, 200, 'Concept explained simply.', {
        explanation,
      });
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  },

  /**
   * @route   POST /api/ai/important-questions
   */
  async getImportantQuestions(req, res, next) {
    try {
      const { text, title } = await AIController.getMaterialText(req);
      const questionsData = await AIService.generateImportantQuestions(text, title);

      return successResponse(res, 200, 'Important exam questions generated.', {
        ...questionsData,
      });
    } catch (err) {
      return errorResponse(res, 400, err.message);
    }
  },
};

export default AIController;
