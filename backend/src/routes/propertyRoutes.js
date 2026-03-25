import express from 'express';
import { PropertyController } from '../controllers/propertyController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', PropertyController.getAllProperties);
router.get('/search', PropertyController.searchProperties);
router.get('/:propertyId', PropertyController.getProperty);

// Protected routes
router.post('/', authenticateToken, authorizeRole('admin', 'agent'), PropertyController.createProperty);
router.put('/:propertyId', authenticateToken, PropertyController.updateProperty);
router.delete('/:propertyId', authenticateToken, PropertyController.deleteProperty);

export default router;
