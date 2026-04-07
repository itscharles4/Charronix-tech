import React, { useState, useEffect, useCallback } from 'react';
import {
    Bell, Send, Users, GraduationCap, BookOpen, Calendar, Megaphone,
    Loader2, Check, AlertCircle, History, ChevronDown, Trash2,
    UserSquare2, UserCheck, RefreshCw
} from 'lucide-react';
import { notificationAPI, teacherAPI, adminAPI } from '../services/api';

interface PrincipalNotificationsPageProps {
    isDarkMode: boolean;
}

const CATEGORIES = ['GENERAL', 'ACADEMIC', 'EVENT', 'ANNOUNCEMENT', 'ATTENDANCE', 'EXAM', 'FEE'];
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const CAT_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    ACADEMIC: { icon: <BookOpen size={14} />, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    EVENT: { icon: <Calendar size={14} />, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    ANNOUNCEMENT: { icon: <Megaphone size={14} />, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    ATTENDANCE: { icon: <UserCheck size={14} />, color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30' },
    EXAM: { icon: <GraduationCap size={14} />, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' },
    FEE: { icon: <Bell size={14} />, color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    GENERAL: { icon: <Bell size={14} />, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
};

const PRIORITY_COLOR: Record<string, string> = {
    LOW: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
    NORMAL: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    HIGH: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20',
    URGENT: 'text-red-700 bg-red-50 dark:bg-red-900/20',
};

const TARGET_OPTIONS = [
    { value: 'ALL_STUDENTS', label: '🎓 All Students', icon: <GraduationCap size={16} /> },
    { value: 'SPECIFIC_STUDENT', label: '👤 Specific Student', icon: <UserCheck size={16} /> },
    { value: 'ALL_TEACHERS', label: '👨‍🏫 All Teachers', icon: <Users size={16} /> },
    { value: 'SPECIFIC_TEACHER', label: '👤 Specific Teacher', icon: <UserSquare2 size={16} /> },
];

function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupByDate(items: any[]) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: Record<string, any[]> = { Today: [], Yesterday: [], 'This Week': [], Older: [] };
    items.forEach(n => {
        const d = new Date(n.createdAt); d.setHours(0, 0, 0, 0);
        if (d >= today) groups.Today.push(n);
        else if (d >= yesterday) groups.Yesterday.push(n);
        else if (d >= weekAgo) groups['This Week'].push(n);
        else groups.Older.push(n);
    });
    return groups;
}

const EMPTY_COMPOSE = {
    targetType: 'ALL_STUDENTS' as string,
    targetStudentId: '',
    targetTeacherId: '',
    title: '',
    message: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    iconEmoji: '',
};

const PrincipalNotificationsPage: React.FC<PrincipalNotificationsPageProps> = ({ isDarkMode }) => {
    const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';

    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [compose, setCompose] = useState(EMPTY_COMPOSE);
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);

    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loadingPeople, setLoadingPeople] = useState(false);

    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState('');

    // ── Fetch students + teachers for pickers ──
    useEffect(() => {
        setLoadingPeople(true);
        Promise.all([
            notificationAPI.getTeachers().catch(() => ({ data: [] })),
            adminAPI.getAllStudents({ limit: '1000' }).catch(() => ({ data: [] })),
        ]).then(([tRes, sRes]) => {
            setTeachers(Array.isArray(tRes?.data) ? tRes.data : []);
            setStudents(Array.isArray(sRes?.data) ? sRes.data : []);
        }).finally(() => setLoadingPeople(false));
    }, []);

    // ── Fetch sent history ──
    const fetchHistory = useCallback(async () => {
        setLoadingHistory(true);
        setHistoryError('');
        try {
            const res = await notificationAPI.getSent(100);
            if (res.success) setHistory(res.data);
            else setHistoryError(res.message || 'Failed to load history');
        } catch {
            setHistoryError('Network error');
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setSendResult(null);
        try {
            const payload: any = {
                targetType: compose.targetType,
                title: compose.title,
                message: compose.message,
                category: compose.category,
                priority: compose.priority,
                iconEmoji: compose.iconEmoji || undefined,
            };
            if (compose.targetType === 'SPECIFIC_STUDENT') payload.targetStudentId = compose.targetStudentId;
            if (compose.targetType === 'SPECIFIC_TEACHER') payload.targetTeacherId = compose.targetTeacherId;

            const result = await notificationAPI.send(payload);
            if (result.success) {
                setSendResult({ ok: true, msg: result.message });
                setCompose(EMPTY_COMPOSE);
                setTimeout(() => setSendResult(null), 4000);
            } else {
                setSendResult({ ok: false, msg: result.message || 'Failed to send' });
            }
        } catch {
            setSendResult({ ok: false, msg: 'Network error. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    const grouped = groupByDate(history);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* ── Page Header ── */}
            <div className={`${card} p-6 flex items-center justify-between flex-wrap gap-4`}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Bell size={26} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Notification Centre</h1>
                        <p className="text-sm text-slate-400 font-bold mt-0.5">Send announcements to students &amp; teachers</p>
                    </div>
                </div>
                {/* Tab switcher */}
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'compose'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Send size={16} /> Compose
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'history'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <History size={16} /> Sent History
                    </button>
                </div>
            </div>

            {/* ══════════════════════════ COMPOSE TAB ══════════════════════════ */}
            {activeTab === 'compose' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Compose Form */}
                    <div className={`${card} p-8 lg:col-span-2`}>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                            <Send size={18} className="text-indigo-500" /> New Notification
                        </h2>

                        {sendResult && (
                            <div className={`mb-5 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${sendResult.ok
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800'}`}>
                                {sendResult.ok ? <Check size={18} /> : <AlertCircle size={18} />}
                                {sendResult.msg}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="space-y-5">
                            {/* Target Audience */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Send To *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {TARGET_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setCompose({ ...compose, targetType: opt.value, targetStudentId: '', targetTeacherId: '' })}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-xs font-black transition-all ${compose.targetType === opt.value
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            {opt.icon}
                                            <span className="text-center leading-tight">{opt.label.replace(/^[^\s]+\s/, '')}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Specific Student picker */}
                            {compose.targetType === 'SPECIFIC_STUDENT' && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Student *</label>
                                    <select
                                        value={compose.targetStudentId}
                                        onChange={e => setCompose({ ...compose, targetStudentId: e.target.value })}
                                        required
                                        className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <option value="">{loadingPeople ? 'Loading...' : 'Select a student…'}</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo || s.rollNo})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Specific Teacher picker */}
                            {compose.targetType === 'SPECIFIC_TEACHER' && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Teacher *</label>
                                    <select
                                        value={compose.targetTeacherId}
                                        onChange={e => setCompose({ ...compose, targetTeacherId: e.target.value })}
                                        required
                                        className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <option value="">{loadingPeople ? 'Loading...' : 'Select a teacher…'}</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.firstName} {t.lastName} — {t.employeeId}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Category + Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
                                    <select
                                        value={compose.category}
                                        onChange={e => setCompose({ ...compose, category: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Priority</label>
                                    <select
                                        value={compose.priority}
                                        onChange={e => setCompose({ ...compose, priority: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Emoji (optional) */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Icon Emoji (optional)</label>
                                <input
                                    type="text"
                                    value={compose.iconEmoji}
                                    onChange={e => setCompose({ ...compose, iconEmoji: e.target.value })}
                                    placeholder="e.g. 📢 🎉 ⚠️"
                                    maxLength={4}
                                    className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject / Title *</label>
                                <input
                                    type="text"
                                    value={compose.title}
                                    onChange={e => setCompose({ ...compose, title: e.target.value })}
                                    placeholder="e.g. Upcoming Annual Sports Day"
                                    required
                                    className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message *</label>
                                <textarea
                                    rows={5}
                                    value={compose.message}
                                    onChange={e => setCompose({ ...compose, message: e.target.value })}
                                    placeholder="Write your notification message here…"
                                    required
                                    className={`w-full px-4 py-3 rounded-2xl border text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                />
                                <p className="text-right text-xs text-slate-400 mt-1 font-bold">{compose.message.length} chars</p>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-500/25 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {sending
                                    ? <><Loader2 size={18} className="animate-spin" /> Sending…</>
                                    : <><Send size={18} /> Send Notification</>}
                            </button>
                        </form>
                    </div>

                    {/* Sidebar Tips */}
                    <div className="space-y-4">
                        <div className={`${card} p-6`}>
                            <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                <AlertCircle size={16} className="text-amber-500" /> Quick Guide
                            </h3>
                            <div className="space-y-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                                {[
                                    { icon: '🎓', label: 'All Students', desc: 'Sends to every active student with an account' },
                                    { icon: '👨‍🏫', label: 'All Teachers', desc: 'Sends to all faculty members' },
                                    { icon: '👤', label: 'Specific', desc: 'Target a single student or teacher by name' },
                                ].map(tip => (
                                    <div key={tip.label} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <span className="text-lg">{tip.icon}</span>
                                        <div><p className="font-black text-slate-700 dark:text-slate-200">{tip.label}</p><p>{tip.desc}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`${card} p-6`}>
                            <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <Bell size={16} className="text-indigo-500" /> Priority Guide
                            </h3>
                            <div className="space-y-2">
                                {PRIORITIES.map(p => (
                                    <div key={p} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black ${PRIORITY_COLOR[p]}`}>
                                        <span>{p}</span>
                                        <span className="ml-auto font-bold opacity-70">
                                            {p === 'URGENT' ? 'Immediate attention' : p === 'HIGH' ? 'Important' : p === 'NORMAL' ? 'Standard' : 'Informational'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════ SENT HISTORY TAB ══════════════════════════ */}
            {activeTab === 'history' && (
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <History size={18} className="text-indigo-500" /> Sent Notifications
                            </h2>
                            <p className="text-xs text-slate-400 font-bold mt-0.5">All notifications sent by you (Principal)</p>
                        </div>
                        <button
                            onClick={fetchHistory}
                            disabled={loadingHistory}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>

                    {loadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                            <Loader2 size={36} className="animate-spin text-indigo-500" />
                            <p className="font-bold">Loading sent history…</p>
                        </div>
                    ) : historyError ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-500">
                            <AlertCircle size={36} />
                            <p className="font-bold">{historyError}</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                            <History size={36} className="opacity-30" />
                            <p className="font-black text-slate-500">No notifications sent yet</p>
                            <p className="text-sm">Switch to <strong>Compose</strong> to send your first notification.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(grouped).map(([label, items]) => items.length === 0 ? null : (
                                <div key={label}>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                        <span>{label}</span>
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">{items.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {items.map((n: any) => {
                                            const cat = CAT_META[n.category] || CAT_META.GENERAL;
                                            return (
                                                <div key={n.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-sm transition-all">
                                                    {/* Category icon */}
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg} ${cat.color}`}>
                                                        {n.iconEmoji ? <span className="text-xl">{n.iconEmoji}</span> : cat.icon}
                                                    </div>
                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <p className="font-black text-sm text-slate-800 dark:text-slate-100">{n.title}</p>
                                                            <span className="text-[10px] text-slate-400 font-bold flex-shrink-0">{timeAgo(n.createdAt)}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{n.message}</p>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {/* Category badge */}
                                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${cat.bg} ${cat.color}`}>
                                                                {n.category}
                                                            </span>
                                                            {/* Priority */}
                                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${PRIORITY_COLOR[n.priority] || PRIORITY_COLOR.NORMAL}`}>
                                                                {n.priority}
                                                            </span>
                                                            {/* Sender badge — shows who sent it */}
                                                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-purple-600 text-white">
                                                                {n.senderName || n.senderRole}
                                                            </span>
                                                            {/* Sent date */}
                                                            <span className="text-[10px] text-slate-400 font-bold ml-auto">
                                                                {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PrincipalNotificationsPage;
