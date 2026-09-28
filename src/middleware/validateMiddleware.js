import { errorResponse } from '../utils/apiResponse.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates request body for user registration
 */
export const validateRegister = (req, res, next) => {
  const { email, password, fullName } = req.body;
  const errors = [];

  if (!fullName || fullName.trim().length === 0) {
    errors.push('Full name is required.');
  }

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
};

/**
 * Validates request body for user login
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.trim().length === 0) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
};
