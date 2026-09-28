import express from 'express';
import AuthController from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validateMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student
 */
router.post('/register', validateRegister, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login and receive JWT
 */
router.post('/login', validateLogin, AuthController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Protected student profile endpoint
 */
router.get('/profile', requireAuth, AuthController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Client-initiated logout
 */
router.post('/logout', AuthController.logout);

export default router;
