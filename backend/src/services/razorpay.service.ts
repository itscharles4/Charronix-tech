import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export class RazorpayService {
    /**
     * Create a Razorpay order
     */
    static async createOrder(amount: number, receiptId: string, notes?: Record<string, string>) {
        try {
            const options = {
                amount: Math.round(amount * 100), // Convert to paise
                currency: 'INR',
                receipt: receiptId.substring(0, 40), // Razorpay receipt max 40 chars
                notes: notes || {},
            };

            const order = await razorpay.orders.create(options);
            return { success: true, data: order };
        } catch (error: any) {
            console.error('Razorpay create order error:', error);
            throw new Error(error.message || 'Failed to create Razorpay order');
        }
    }

    /**
     * Verify Razorpay payment signature
     */
    static verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
        try {
            const text = `${orderId}|${paymentId}`;
            const generatedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                .update(text)
                .digest('hex');
            return generatedSignature === signature;
        } catch (error) {
            console.error('Razorpay signature verification error:', error);
            return false;
        }
    }

    /**
     * Fetch payment details from Razorpay
     */
    static async getPaymentDetails(paymentId: string) {
        try {
            const payment = await razorpay.payments.fetch(paymentId);
            return { success: true, data: payment };
        } catch (error: any) {
            console.error('Razorpay fetch payment error:', error);
            throw new Error(error.message || 'Failed to fetch payment details');
        }
    }

    /**
     * Create a refund
     */
    static async createRefund(paymentId: string, amount?: number) {
        try {
            const refundOptions: { amount?: number } = {};
            if (amount) refundOptions.amount = Math.round(amount * 100);
            const refund = await razorpay.payments.refund(paymentId, refundOptions);
            return { success: true, data: refund };
        } catch (error: any) {
            console.error('Razorpay refund error:', error);
            throw new Error(error.message || 'Failed to create refund');
        }
    }

    /**
     * Verify Razorpay webhook signature
     */
    static verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
        try {
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(body)
                .digest('hex');
            return expectedSignature === signature;
        } catch {
            return false;
        }
    }
}
