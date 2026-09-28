import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Helper to generate JWT token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'studymate_default_jwt_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    secret,
    { expiresIn }
  );
};

export const AuthController = {
  /**
   * @route   POST /api/auth/register
   * @desc    Register a new student account
   * @access  Public
   */
  async register(req, res, next) {
    try {
      const { email, password, fullName, collegeCourse } = req.body;

      // 1. Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return errorResponse(res, 409, 'An account with this email address already exists.');
      }

      // 2. Hash password with bcrypt (salt rounds = 10)
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 3. Save new user in database
      const user = await UserModel.create({
        email,
        passwordHash,
        fullName,
        collegeCourse,
      });

      // 4. Generate JWT token
      const token = generateToken(user);

      return successResponse(res, 201, 'Student account registered successfully!', {
        user,
        token,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   POST /api/auth/login
   * @desc    Authenticate student and return JWT token
   * @access  Public
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      // 2. Verify password hash using bcrypt
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      // 3. Exclude password_hash from response
      const safeUser = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        college_course: user.college_course,
        created_at: user.created_at,
      };

      // 4. Generate JWT
      const token = generateToken(user);

      return successResponse(res, 200, 'Login successful!', {
        user: safeUser,
        token,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @route   GET /api/auth/profile
   * @desc    Get currently logged-in student profile
   * @access  Private (Requires JWT)
   */
  async getProfile(req, res) {
    return successResponse(res, 200, 'Student profile fetched successfully.', {
      user: req.user,
    });
  },

  /**
   * @route   POST /api/auth/logout
   * @desc    Logout student (Client removes stored token)
   * @access  Public
   */
  async logout(req, res) {
    return successResponse(res, 200, 'Logout successful. Please clear token on client.');
  },
};

export default AuthController;
