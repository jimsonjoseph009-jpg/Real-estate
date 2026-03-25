import express from 'express';
import { InquiryController } from '../controllers/inquiryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', InquiryController.createInquiry);

// Protected routes
router.get('/property/:propertyId', authenticateToken, InquiryController.getPropertyInquiries);
router.put('/:inquiryId/status', authenticateToken, InquiryController.updateInquiryStatus);
router.get('/user/my-inquiries', authenticateToken, InquiryController.getUserInquiries);

export default router;
