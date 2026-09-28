import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiResponse.js';
import UserModel from '../models/userModel.js';

/**
 * Authentication Middleware
 * Validates JWT tokens in the Authorization header.
 * Attaches the authenticated student record to req.user.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(
        res,
        401,
        'Access denied. No valid authentication token provided in Authorization header.'
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 401, 'Authentication token is empty.');
    }

    // Verify token using secret
    const secret = process.env.JWT_SECRET || 'studymate_default_jwt_secret';
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Your session has expired. Please login again.');
      }
      return errorResponse(res, 401, 'Invalid authentication token.');
    }

    // Retrieve user profile
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 401, 'The account associated with this token no longer exists.');
    }

    // Attach user payload to request
    req.user = user;
    next();
  } catch (err) {
    console.error('❌ [requireAuth Error]:', err.message);
    return errorResponse(res, 500, 'Authentication error occurred.');
  }
};

export default requireAuth;
