import { useState, useEffect } from 'react';
import { Plus, X, Save, Loader2, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { feeAPI } from '../../services/api';

const FEE_TYPES = ['ACADEMIC', 'TRANSPORT', 'HOSTEL', 'EXAM', 'LIBRARY', 'REGISTRATION', 'MISCELLANEOUS'];
const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const CUR_YEAR = '2025-26';

interface FormData {
    feeType: string;
    class: string;
    academicYear: string;
    amount: string;
    dueDate: string;
    lateFee: string;
    discount: string;
    description: string;
}

const BLANK: FormData = {
    feeType: 'ACADEMIC', class: '1', academicYear: CUR_YEAR,
    amount: '', dueDate: '', lateFee: '0', discount: '0', description: '',
};

export default function FeeStructureManager() {
    const [structures, setStructures] = useState<any[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormData>(BLANK);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => { fetchStructures(); }, []);

    const fetchStructures = async () => {
        try {
            setLoadingList(true);
            const result = await feeAPI.listFeeStructures();
            if (result.success) setStructures(result.data);
        } catch { /* noop */ }
        finally { setLoadingList(false); }
    };

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await feeAPI.createFeeStructure({
                feeType: form.feeType,
                class: form.class,
                academicYear: form.academicYear,
                amount: parseFloat(form.amount),
                dueDate: form.dueDate,
                lateFee: parseFloat(form.lateFee) || 0,
                discount: parseFloat(form.discount) || 0,
                description: form.description,
            });
            if (result.success) {
                showToast('success', result.message || 'Fee structure created!');
                setShowForm(false);
                setForm(BLANK);
                fetchStructures();
            } else {
                showToast('error', result.message || 'Failed to create fee structure');
            }
        } catch (e: any) {
            showToast('error', e.message || 'Unexpected error');
        } finally {
            setSubmitting(false);
        }
    };

    const field = (key: keyof FormData) => ({
        value: form[key],
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value })),
    });

    const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition';

    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Fee Structure Manager</h1>
                    <p className="text-sm text-slate-400 mt-1">Create and manage fee structures per class</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition text-sm"
                >
                    {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Fee Structure</>}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-fadeIn">
                    <h3 className="font-black text-slate-800 dark:text-slate-100 mb-5">Create Fee Structure</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Fee Type */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Fee Type *</label>
                                <select {...field('feeType')} required className={inputCls}>
                                    {FEE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Class */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Class *</label>
                                <select {...field('class')} required className={inputCls}>
                                    {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
                                </select>
                            </div>

                            {/* Academic Year */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Academic Year *</label>
                                <input type="text" {...field('academicYear')} placeholder="2025-26" required className={inputCls} />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Amount (₹) *</label>
                                <input type="number" {...field('amount')} placeholder="15000" required min="1" step="0.01" className={inputCls} />
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Due Date *</label>
                                <input type="date" {...field('dueDate')} required className={inputCls} />
                            </div>

                            {/* Late Fee */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Late Fee (₹)</label>
                                <input type="number" {...field('lateFee')} placeholder="500" min="0" step="0.01" className={inputCls} />
                            </div>

                            {/* Discount */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Discount (₹)</label>
                                <input type="number" {...field('discount')} placeholder="0" min="0" step="0.01" className={inputCls} />
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Description</label>
                                <textarea
                                    {...field('description')}
                                    placeholder="Annual academic fee for 2025-26…"
                                    rows={2}
                                    className={inputCls + ' resize-none'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <><Loader2 size={18} className="animate-spin" /> Creating…</> : <><Save size={18} /> Create Fee Structure</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Existing Structures */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-slate-800 dark:text-slate-100">
                        Existing Fee Structures
                        {!loadingList && <span className="ml-2 px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black">{structures.length}</span>}
                    </h3>
                </div>

                {loadingList ? (
                    <div className="p-12 text-center">
                        <Loader2 size={28} className="animate-spin text-indigo-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Loading…</p>
                    </div>
                ) : structures.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-400 font-semibold">No fee structures yet. Create one above.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/60">
                                <tr>
                                    {['Fee Type', 'Class', 'Year', 'Amount', 'Late Fee', 'Due Date', 'Students', 'Status'].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {structures.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-black">{s.feeType}</span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300">Class {s.class}</td>
                                        <td className="px-5 py-4 text-slate-500">{s.academicYear}</td>
                                        <td className="px-5 py-4 font-black text-slate-800 dark:text-slate-100">{fmt(s.amount)}</td>
                                        <td className="px-5 py-4 text-amber-600 font-semibold">{fmt(s.lateFee)}</td>
                                        <td className="px-5 py-4 text-slate-500">{new Date(s.dueDate).toLocaleDateString('en-IN')}</td>
                                        <td className="px-5 py-4 font-bold text-slate-600 dark:text-slate-400">{s._count?.feeRecords ?? 0}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {s.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
