import { errorResponse } from '../utils/apiResponse.js';

/**
 * 404 Route Not Found Middleware
 * Intercepts requests to endpoints that do not exist.
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, `Route not found: [${req.method}] ${req.originalUrl}`);
};

/**
 * Global Error Handler Middleware
 * Catches any unhandled error thrown in controllers or services,
 * formats a clean response, and prevents server crashes.
 */
export const globalErrorHandler = (err, req, res, next) => {
  console.error('❌ [Global Error Handler]:', err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};
