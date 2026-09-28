import pdf from 'pdf-parse';

/**
 * PDF Processing Service
 * Extracts text and metadata from uploaded PDF documents.
 */
export const PDFService = {
  async extractText(buffer) {
    try {
      const data = await pdf(buffer);

      const rawText = data.text || '';
      const pageCount = data.numpages || 1;
      const metadata = data.info || {};

      if (!rawText.trim()) {
        throw new Error(
          'No readable text could be extracted from this PDF. It may contain only scanned images or be password protected.'
        );
      }

      return {
        rawText,
        pageCount,
        metadata,
      };
    } catch (err) {
      console.error('❌ [PDFService Error]:', err.message);
      if (err.message.includes('password') || err.message.includes('encrypted')) {
        throw new Error('This PDF is password-protected. Please upload an unlocked PDF.');
      }
      throw new Error(`Failed to extract text from PDF: ${err.message}`);
    }
  },
};

export default PDFService;
