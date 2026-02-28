import { useState, useEffect } from 'react';
import { Download, Calendar, CreditCard, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { feeAPI } from '../../services/api';
import { jsPDF } from 'jspdf';

interface PaymentHistoryProps {
    studentId: string;
}

export default function PaymentHistory({ studentId }: PaymentHistoryProps) {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (studentId) fetchHistory();
    }, [studentId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const result = await feeAPI.getPaymentHistory(studentId);
            if (result.success) setPayments(result.data);
        } catch (err) {
            console.error('Error fetching payment history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = (payment: any) => {
        const doc = new jsPDF();

        // Settings
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text('CHARRONIX SCHOOL', pageWidth / 2, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Official Fee Payment Receipt', pageWidth / 2, 38, { align: 'center' });

        // Horizontal Line
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, 45, pageWidth - margin, 45);

        // Receipt Details
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.setFont('helvetica', 'bold');
        doc.text('RECEIPT DETAILS', margin, 60);

        doc.setFont('helvetica', 'normal');
        doc.text(`Receipt Number: ${payment.receiptNumber}`, margin, 70);
        doc.text(`Transaction ID: ${payment.transactionId}`, margin, 78);
        doc.text(`Date: ${new Date(payment.paidAt).toLocaleDateString('en-IN')}`, margin, 86);
        doc.text(`Payment Method: ${payment.paymentMethod}`, margin, 94);

        // Student Details
        doc.setFont('helvetica', 'bold');
        doc.text('STUDENT DETAILS', margin, 110);
        doc.setFont('helvetica', 'normal');
        doc.text(`Student ID: ${studentId}`, margin, 120);

        // Table Header
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, 135, pageWidth - (margin * 2), 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('Description', margin + 5, 142);
        doc.text('Amount', pageWidth - margin - 30, 142);

        // Table Content
        doc.setFont('helvetica', 'normal');
        doc.text(`Fee Payment - ${payment.feeType}`, margin + 5, 155);
        doc.text(`INR ${payment.amount.toLocaleString('en-IN')}`, pageWidth - margin - 30, 155);

        // Total
        doc.line(margin, 165, pageWidth - margin, 165);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL PAID', margin + 5, 175);
        doc.text(`INR ${payment.amount.toLocaleString('en-IN')}`, pageWidth - margin - 30, 175);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('This is a computer generated receipt and does not require a signature.', pageWidth / 2, 210, { align: 'center' });
        doc.setTextColor(79, 70, 229);
        doc.text('Thank you for your payment!', pageWidth / 2, 220, { align: 'center' });

        // Save
        doc.save(`Receipt_${payment.receiptNumber}.pdf`);
    };

    const fmt = (n: number) =>
        '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    const methodIcon = (m: string) => ({ RAZORPAY: '💳', STRIPE: '💳', PAYPAL: '🅿️', CASH: '💵', BANK_TRANSFER: '🏦' }[m] || '💰');

    const statusBadge = (s: string) => {
        if (s === 'COMPLETED') return { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle };
        if (s === 'FAILED') return { cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle };
        return { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock };
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
                <Loader2 size={28} className="animate-spin text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Loading payment history…</p>
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <CreditCard size={28} className="text-slate-400" />
                </div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 mb-1">No Payment History</h3>
                <p className="text-sm text-slate-400">No transactions yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-slate-800 dark:text-slate-100">Payment History</h3>
                <p className="text-xs text-slate-400 mt-0.5">All previous transactions</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                            {['Receipt No', 'Fee Type', 'Amount', 'Method', 'Date', 'Status', ''].map((h) => (
                                <th key={h} className="px-5 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wide">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payments.map((p) => {
                            const { cls, icon: Icon } = statusBadge(p.status);
                            return (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                                        {p.receiptNumber}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                                            {p.feeType}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-black text-emerald-600">{fmt(p.amount)}</td>
                                    <td className="px-5 py-4">
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-base">{methodIcon(p.paymentMethod)}</span>
                                            <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">{p.paymentMethod}</span>
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="flex items-center gap-1 text-slate-500">
                                            <Calendar size={13} />
                                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black w-fit ${cls}`}>
                                            <Icon size={12} />
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {p.status === 'COMPLETED' && (
                                            <button
                                                onClick={() => handleDownloadReceipt(p)}
                                                title="Download Receipt"
                                                className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 transition"
                                            >
                                                <Download size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
