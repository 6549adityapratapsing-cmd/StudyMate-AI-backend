import multer from 'multer';

// Use memory storage so we have immediate access to file buffer for PDF extraction and OCR
const storage = multer.memoryStorage();

// Allowed file MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'text/plain',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Please upload a PDF, Image (PNG/JPG), or Plain Text document.`
      ),
      false
    );
  }
};

// 20MB file limit
export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
  fileFilter,
});

export default upload;
