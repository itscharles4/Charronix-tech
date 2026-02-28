import { useState } from 'react';
import { X, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { feeAPI } from '../../services/api';
import { openRazorpayCheckout } from '../../utils/razorpay';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    selectedFeeIds: string[];
    totalAmount: number;
    onPaymentSuccess: () => void;
}

export default function PaymentModal({
    isOpen,
    onClose,
    studentId,
    studentName,
    selectedFeeIds,
    totalAmount,
    onPaymentSuccess,
}: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const fmt = (n: number) =>
        '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    const handlePayment = async () => {
        setProcessing(true);
        setError('');

        try {
            // Step 1: Create order on backend
            const initiateResult = await feeAPI.initiatePayment({
                studentId,
                feeRecordIds: selectedFeeIds,
                paymentMethod,
            });

            if (!initiateResult.success) {
                throw new Error(initiateResult.message || 'Failed to initiate payment');
            }

            const { orderId, amount, currency, keyId } = initiateResult.data;

            // Step 2: Open Razorpay checkout
            openRazorpayCheckout({
                key: keyId,
                amount: Math.round(amount * 100), // rupees → paise
                currency: currency || 'INR',
                order_id: orderId,
                name: 'Charronix School',
                description: `School Fee — ${studentName}`,
                prefill: {
                    name: localStorage.getItem('parentName') || studentName,
                    email: localStorage.getItem('parentEmail') || '',
                    contact: localStorage.getItem('parentPhone') || '',
                },
                theme: { color: '#6366f1' },
                handler: async (response) => {
                    try {
                        const verifyResult = await feeAPI.verifyPayment({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                        });

                        if (verifyResult.success) {
                            setSuccess(true);
                            setTimeout(() => onPaymentSuccess(), 2200);
                        } else {
                            throw new Error(verifyResult.message || 'Verification failed');
                        }
                    } catch (e: any) {
                        setError(e.message || 'Payment verification failed');
                    } finally {
                        setProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                        setError('Payment was cancelled.');
                    },
                },
            });
        } catch (e: any) {
            setError(e.message || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={!processing ? onClose : undefined}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 p-7 transition-all">
                {success ? (
                    <div className="text-center py-8 animate-fadeIn">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
                            <CheckCircle size={44} className="text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Payment Successful! 🎉</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {fmt(totalAmount)} received. A receipt has been sent to your registered contact.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Complete Payment</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Secure • Encrypted • Instant</p>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={processing}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40"
                            >
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
                                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Amount */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-indigo-500/20">
                            <div className="text-xs font-bold opacity-80 mb-1">TOTAL PAYABLE</div>
                            <div className="text-4xl font-black">{fmt(totalAmount)}</div>
                            <div className="text-xs opacity-80 mt-1">{selectedFeeIds.length} fee(s) selected</div>
                        </div>

                        {/* Method Selection */}
                        <div className="mb-6">
                            <p className="text-xs font-black text-slate-400 uppercase mb-3">Payment Method</p>
                            <button
                                onClick={() => setPaymentMethod('RAZORPAY')}
                                className={`w-full p-4 rounded-2xl border-2 transition flex items-center justify-between ${paymentMethod === 'RAZORPAY'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                        : 'border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <CreditCard size={22} className="text-blue-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">Razorpay</div>
                                        <div className="text-xs text-slate-400">Cards • UPI • Net Banking • Wallets</div>
                                    </div>
                                </div>
                                {paymentMethod === 'RAZORPAY' && (
                                    <CheckCircle size={20} className="text-indigo-500 flex-shrink-0" />
                                )}
                            </button>

                            <button
                                disabled
                                className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center gap-3 mt-3 opacity-40 cursor-not-allowed"
                            >
                                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <CreditCard size={22} className="text-purple-500" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">Stripe</div>
                                    <div className="text-xs text-slate-400">International Cards — Coming Soon</div>
                                </div>
                            </button>
                        </div>

                        {/* Terms */}
                        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                            By proceeding you agree to our{' '}
                            <span className="text-indigo-500 font-semibold cursor-pointer">Terms & Conditions</span>{' '}
                            and{' '}
                            <span className="text-indigo-500 font-semibold cursor-pointer">Privacy Policy</span>.
                            Payments are securely processed via Razorpay.
                        </p>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-lg shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    PROCESSING…
                                </>
                            ) : (
                                <>
                                    <CreditCard size={20} />
                                    PAY {fmt(totalAmount)}
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-slate-400 mt-4">🔒 256-bit SSL encrypted payment</p>
                    </>
                )}
            </div>
        </>
    );
}
