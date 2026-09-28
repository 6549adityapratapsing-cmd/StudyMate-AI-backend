/**
 * Text Cleaning Service
 * Normalizes extracted text from PDFs, OCR, and pasted notes.
 * Prepares clean, token-efficient text for AI prompts.
 */
export const TextCleanerService = {
  cleanText(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return '';
    }

    let cleaned = rawText;

    // 1. Normalize line breaks to standard \n
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 2. Fix hyphenated line breaks (e.g., "fundamen-\ntal" -> "fundamental")
    cleaned = cleaned.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');

    // 3. Remove common PDF header/footer page patterns (e.g. "Page 12 of 45", "--- Page 3 ---")
    cleaned = cleaned.replace(/(?:Page\s*\d+\s*(?:of|\/)\s*\d+)/gi, '');
    cleaned = cleaned.replace(/(?:---+\s*Page\s*\d+\s*---+)/gi, '');

    // 4. Remove strange non-printable control characters except standard punctuation and newlines
    cleaned = cleaned.replace(/[^\x20-\x7E\n\t\u00C0-\u024F\u1E00-\u1EFF]/g, ' ');

    // 5. Consolidate excessive horizontal spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    // 6. Consolidate more than 2 consecutive newlines into 2 (preserving paragraph structure)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
  },

  calculateStats(text) {
    if (!text) return { wordCount: 0, charCount: 0, estimatedReadingMinutes: 0 };
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = text.length;
    // Average student reading speed: ~200 words per minute
    const estimatedReadingMinutes = Math.ceil(wordCount / 200);

    return {
      wordCount,
      charCount,
      estimatedReadingMinutes,
    };
  },
};

export default TextCleanerService;
