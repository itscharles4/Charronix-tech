import { Router } from 'express';
import { FeeController } from '../controllers/fee.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Student / Parent routes
router.get('/student/:studentId', FeeController.getStudentFees);
router.get('/payment-history/:studentId', FeeController.getPaymentHistory);
router.post('/initiate-payment', FeeController.initiatePayment);
router.post('/verify-payment', FeeController.verifyPayment);

// Admin routes
router.get('/structures', FeeController.listFeeStructures);
router.post('/structure', FeeController.createFeeStructure);
router.get('/summary', FeeController.getFeeSummary);

export default router;
