// utils/razorpay.ts — Razorpay checkout helper

export interface RazorpayOptions {
    key: string;
    amount: number;          // in paise (multiply rupees × 100)
    currency: string;
    order_id: string;
    name: string;
    description: string;
    image?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string };
    handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => void;
    modal?: { ondismiss?: () => void };
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const openRazorpayCheckout = (options: RazorpayOptions) => {
    if (!window.Razorpay) {
        alert('Razorpay SDK failed to load. Please refresh the page and try again.');
        return;
    }
    const rzp = new window.Razorpay(options);
    rzp.open();
};
