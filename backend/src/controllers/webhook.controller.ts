import { Request, Response } from 'express';
import prisma from '../config/database';
import { RazorpayService } from '../services/razorpay.service';

export class WebhookController {
    /**
     * POST /api/v1/webhooks/razorpay
     * Razorpay event webhook (for server-side confirmation)
     */
    static async handleRazorpay(req: Request, res: Response) {
        try {
            const signature = req.headers['x-razorpay-signature'] as string;
            const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

            if (!secret) {
                console.warn('RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification');
            } else {
                const isValid = RazorpayService.verifyWebhookSignature(
                    JSON.stringify(req.body),
                    signature,
                    secret,
                );
                if (!isValid) {
                    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
                }
            }

            const event = req.body;
            console.log('Razorpay webhook event:', event.event);

            switch (event.event) {
                case 'payment.captured': {
                    const paymentEntity = event.payload?.payment?.entity;
                    if (paymentEntity) {
                        // Update any PENDING payments with this gateway payment ID
                        await prisma.payment.updateMany({
                            where: { gatewayOrderId: paymentEntity.order_id, status: 'PENDING' },
                            data: { status: 'COMPLETED', gatewayPaymentId: paymentEntity.id, paidAt: new Date() },
                        });
                    }
                    break;
                }

                case 'payment.failed': {
                    const paymentEntity = event.payload?.payment?.entity;
                    if (paymentEntity) {
                        await prisma.payment.updateMany({
                            where: { gatewayOrderId: paymentEntity.order_id, status: 'PENDING' },
                            data: { status: 'FAILED' },
                        });
                    }
                    break;
                }

                default:
                    console.log('Unhandled webhook event:', event.event);
            }

            return res.json({ success: true });
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(500).json({ success: false });
        }
    }
}
