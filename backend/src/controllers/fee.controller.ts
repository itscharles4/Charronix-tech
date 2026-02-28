import { Response } from 'express';
import { FeeService } from '../services/fee.service';
import { FeeType, PaymentMethod } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

export class FeeController {
    /**
     * GET /api/v1/fees/student/:studentId
     */
    static async getStudentFees(req: AuthRequest, res: Response) {
        try {
            const { studentId } = req.params;
            const result = await FeeService.getStudentFeeDetails(studentId);
            return res.json(result);
        } catch (error: any) {
            console.error('Get student fees error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Failed to fetch fee details' });
        }
    }

    /**
     * POST /api/v1/fees/initiate-payment
     */
    static async initiatePayment(req: AuthRequest, res: Response) {
        try {
            const { studentId, feeRecordIds, paymentMethod } = req.body;
            const parentUserId = req.user?.userId;

            if (!parentUserId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            if (!studentId || !feeRecordIds || !Array.isArray(feeRecordIds) || feeRecordIds.length === 0) {
                return res.status(400).json({ success: false, message: 'studentId and feeRecordIds are required' });
            }

            const result = await FeeService.initiatePayment({
                studentId,
                parentUserId,
                feeRecordIds,
                paymentMethod: (paymentMethod as PaymentMethod) || 'RAZORPAY',
            });
            return res.json(result);
        } catch (error: any) {
            console.error('Initiate payment error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Failed to initiate payment' });
        }
    }

    /**
     * POST /api/v1/fees/verify-payment
     */
    static async verifyPayment(req: AuthRequest, res: Response) {
        try {
            const { orderId, paymentId, signature } = req.body;

            if (!orderId || !paymentId || !signature) {
                return res.status(400).json({ success: false, message: 'Missing required payment details' });
            }

            const result = await FeeService.verifyPayment({ orderId, paymentId, signature });
            return res.json(result);
        } catch (error: any) {
            console.error('Verify payment error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
        }
    }

    /**
     * GET /api/v1/fees/payment-history/:studentId
     */
    static async getPaymentHistory(req: AuthRequest, res: Response) {
        try {
            const { studentId } = req.params;
            const result = await FeeService.getPaymentHistory(studentId);
            return res.json(result);
        } catch (error: any) {
            console.error('Get payment history error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Failed to fetch payment history' });
        }
    }

    /**
     * POST /api/v1/fees/structure — Admin only
     */
    static async createFeeStructure(req: AuthRequest, res: Response) {
        try {
            const role = req.user?.role;
            if (role !== 'ADMIN' && role !== 'PRINCIPAL') {
                return res.status(403).json({ success: false, message: 'Only admins can create fee structures' });
            }

            const { feeType, class: cls, academicYear, amount, dueDate, lateFee, discount, description } = req.body;

            if (!feeType || !cls || !academicYear || !amount || !dueDate) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const result = await FeeService.createFeeStructure({
                schoolId: 'charronix-school', // single-school system
                feeType: feeType as FeeType,
                class: cls,
                academicYear,
                amount: parseFloat(amount),
                dueDate: new Date(dueDate),
                lateFee: lateFee ? parseFloat(lateFee) : 0,
                discount: discount ? parseFloat(discount) : 0,
                description,
            });
            return res.status(201).json(result);
        } catch (error: any) {
            console.error('Create fee structure error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Failed to create fee structure' });
        }
    }

    /**
     * GET /api/v1/fees/structures — Admin only
     */
    static async listFeeStructures(req: AuthRequest, res: Response) {
        try {
            const role = req.user?.role;
            if (role !== 'ADMIN' && role !== 'PRINCIPAL') {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
            const result = await FeeService.listFeeStructures('charronix-school');
            return res.json(result);
        } catch (error: any) {
            console.error('List fee structures error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Failed to fetch fee structures' });
        }
    }

    /**
     * GET /api/v1/fees/summary — Admin only
     */
    static async getFeeSummary(req: AuthRequest, res: Response) {
        try {
            const role = req.user?.role;
            if (role !== 'ADMIN' && role !== 'PRINCIPAL') {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
            const academicYear = (req.query.academicYear as string) || '2025-26';
            const result = await FeeService.getFeeCollectionSummary('charronix-school', academicYear);
            return res.json(result);
        } catch (error: any) {
            console.error('Get fee summary error:', error);
            return res.status(500).json({ success: false, message: error.message || 'Failed to fetch fee summary' });
        }
    }
}
