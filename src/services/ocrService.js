import { createWorker } from 'tesseract.js';

/**
 * Optical Character Recognition (OCR) Service
 * Extracts text from photos of handwritten or printed notes using Tesseract.js.
 */
export const OCRService = {
  async extractTextFromImage(buffer) {
    let worker = null;
    try {
      // Initialize Tesseract Worker with English language
      worker = await createWorker('eng');

      // Recognize text from image buffer
      const ret = await worker.recognize(buffer);
      const rawText = ret.data.text || '';
      const confidence = ret.data.confidence || 0;

      // Validate extraction quality
      if (!rawText.trim() || rawText.trim().length < 5) {
        throw new Error(
          'Could not detect any readable text in this image. Please ensure the photo is clear, well-lit, and in focus.'
        );
      }

      if (confidence < 30) {
        console.warn(`⚠️ [OCRService]: Low recognition confidence: ${confidence}%`);
      }

      return {
        rawText,
        confidence,
      };
    } catch (err) {
      console.error('❌ [OCRService Error]:', err.message);
      throw new Error(`OCR Processing Failed: ${err.message}`);
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  },
};

export default OCRService;
