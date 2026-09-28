/**
 * Standardized API Response Helper
 * Keeps all API responses consistent across the entire backend.
 *
 * Success format:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": { ... }
 * }
 *
 * Error format:
 * {
 *   "success": false,
 *   "message": "...",
 *   "errors": [ ... ] or null
 * }
 */

export const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
