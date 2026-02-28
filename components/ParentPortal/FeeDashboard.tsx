import { useState, useEffect } from 'react';
import {
    CreditCard,
    DollarSign,
    Calendar,
    AlertCircle,
    CheckCircle,
    Loader2,
} from 'lucide-react';
import { feeAPI } from '../../services/api';
import PaymentModal from './PaymentModal.tsx';
import PaymentHistory from './PaymentHistory.tsx';

interface FeeDashboardProps {
    studentId: string;
}

export default function FeeDashboard({ studentId }: FeeDashboardProps) {
    const [feeData, setFeeData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFees, setSelectedFees] = useState<string[]>([]);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (studentId) fetchFeeDetails();
    }, [studentId]);

    const fetchFeeDetails = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await feeAPI.getStudentFees(studentId);
            if (result.success) {
                setFeeData(result.data);
            } else {
                setError(result.message || 'Failed to load fee data');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load fee data');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFee = (id: string) =>
        setSelectedFees((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const unpaidIds = feeData?.feeRecords.filter((fr: any) => !fr.isPaid).map((fr: any) => fr.id) ?? [];

    const handleSelectAll = () =>
        setSelectedFees(selectedFees.length === unpaidIds.length ? [] : unpaidIds);

    const getTotalSelected = () =>
        (feeData?.feeRecords ?? [])
            .filter((fr: any) => selectedFees.includes(fr.id))
            .reduce((s: number, fr: any) => s + fr.remainingAmount + fr.lateFeeApplied, 0);

    const fmt = (n: number) =>
        '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    const getFeeIcon = (type: string) => {
        const icons: Record<string, string> = {
            ACADEMIC: '📚', TRANSPORT: '🚌', HOSTEL: '🏠',
            EXAM: '📝', LIBRARY: '📖', REGISTRATION: '📋', MISCELLANEOUS: '💰',
        };
        return icons[type] || '💰';
    };

    const getStatusBadge = (status: string, isPaid: boolean) => {
        if (isPaid) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (status === 'FAILED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
                <p className="text-slate-500 font-semibold">Loading fee details…</p>
            </div>
        );
    }

    if (error || !feeData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 gap-4">
                <AlertCircle size={48} className="text-red-400" />
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">No Fee Data</h3>
                <p className="text-slate-500">{error || 'No fee information available.'}</p>
            </div>
        );
    }

    const { student, summary, feeRecords } = feeData;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Fee Management</h1>
                <p className="text-sm text-slate-400 mt-1">
                    {student.name} • Class {student.class}-{student.section} • {student.admissionNo}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <DollarSign size={20} />
                        <span className="text-sm font-bold">Total Due</span>
                    </div>
                    <div className="text-3xl font-black">{fmt(summary.totalDue)}</div>
                    {summary.overdueAmount > 0 && (
                        <div className="mt-2 text-xs opacity-90">
                            <AlertCircle size={12} className="inline mr-1" />
                            Overdue: {fmt(summary.overdueAmount)}
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <CheckCircle size={20} />
                        <span className="text-sm font-bold">Total Paid</span>
                    </div>
                    <div className="text-3xl font-black">{fmt(summary.totalPaid)}</div>
                    <div className="mt-2 text-xs opacity-90">This Academic Year</div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <CreditCard size={20} />
                        <span className="text-sm font-bold">Selected</span>
                    </div>
                    <div className="text-3xl font-black">{fmt(getTotalSelected())}</div>
                    <div className="mt-2 text-xs opacity-90">{selectedFees.length} fee(s) selected</div>
                </div>
            </div>

            {/* Fee Records Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-slate-800 dark:text-slate-100">Fee Details</h3>
                    <div className="flex items-center gap-3">
                        {unpaidIds.length > 0 && (
                            <button
                                onClick={handleSelectAll}
                                className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition"
                            >
                                {selectedFees.length === unpaidIds.length ? 'Deselect All' : 'Select All Unpaid'}
                            </button>
                        )}
                        {selectedFees.length > 0 && (
                            <button
                                onClick={() => setPaymentModalOpen(true)}
                                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition text-sm"
                            >
                                Pay Now
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/60">
                            <tr>
                                {['', 'Fee Type', 'Description', 'Total', 'Paid', 'Remaining', 'Due Date', 'Status'].map(
                                    (h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {feeRecords.map((fee: any) => (
                                <tr
                                    key={fee.id}
                                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${selectedFees.includes(fee.id) ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                                        }`}
                                >
                                    <td className="px-5 py-4">
                                        {!fee.isPaid && (
                                            <input
                                                type="checkbox"
                                                checked={selectedFees.includes(fee.id)}
                                                onChange={() => handleSelectFee(fee.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getFeeIcon(fee.feeType)}</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-100">{fee.feeType}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{fee.description || '—'}</td>
                                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">{fmt(fee.totalAmount)}</td>
                                    <td className="px-5 py-4 font-bold text-emerald-600">{fmt(fee.paidAmount)}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-bold text-red-600">{fmt(fee.remainingAmount + fee.lateFeeApplied)}</span>
                                        {fee.lateFeeApplied > 0 && (
                                            <div className="text-xs text-amber-600 mt-0.5">+{fmt(fee.lateFeeApplied)} late fee</div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className={`flex items-center gap-1 ${fee.isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                                            <Calendar size={13} />
                                            {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                                        </div>
                                        {fee.isOverdue && <span className="text-xs text-red-600 font-black">OVERDUE</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${getStatusBadge(fee.status, fee.isPaid)}`}>
                                            {fee.isPaid ? 'PAID' : fee.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {feeRecords.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                                        No fee records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment History */}
            <PaymentHistory studentId={studentId} />

            {/* Payment Modal */}
            {paymentModalOpen && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    studentId={studentId}
                    studentName={student.name}
                    selectedFeeIds={selectedFees}
                    totalAmount={getTotalSelected()}
                    onPaymentSuccess={() => {
                        setPaymentModalOpen(false);
                        setSelectedFees([]);
                        fetchFeeDetails();
                    }}
                />
            )}
        </div>
    );
}
