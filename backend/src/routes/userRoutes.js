import express from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/agents', UserController.getAgents);

// Protected routes
router.get('/profile', authenticateToken, UserController.getProfile);
router.put('/profile', authenticateToken, UserController.updateProfile);

export default router;
