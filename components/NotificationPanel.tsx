import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Bell, Check, CheckCheck, Trash2, Send, Calendar, BookOpen,
    Megaphone, Users, Loader2, GraduationCap, AlertCircle, ChevronRight
} from 'lucide-react';
import { notificationAPI, teacherAPI } from '../services/api';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: string;
    isDarkMode: boolean;
    onUnreadCountChange?: (count: number) => void;
}

const CATEGORIES = ['ALL', 'ACADEMIC', 'EVENT', 'ANNOUNCEMENT', 'ATTENDANCE', 'EXAM', 'GENERAL'];

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    ACADEMIC: { icon: <BookOpen size={14} />, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    EVENT: { icon: <Calendar size={14} />, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    ANNOUNCEMENT: { icon: <Megaphone size={14} />, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    ATTENDANCE: { icon: <Users size={14} />, color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30' },
    EXAM: { icon: <GraduationCap size={14} />, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' },
    GENERAL: { icon: <Bell size={14} />, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
};

const ROLE_BADGE: Record<string, string> = {
    PRINCIPAL: 'bg-purple-600 text-white',
    TEACHER: 'bg-blue-600 text-white',
    ADMIN: 'bg-slate-600 text-white',
    SYSTEM: 'bg-emerald-600 text-white',
};

function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

const EMPTY_COMPOSE = {
    targetType: 'ALL_STUDENTS' as 'ALL_STUDENTS' | 'SPECIFIC_STUDENT',
    targetStudentId: '',
    title: '',
    message: '',
    category: 'GENERAL',
    priority: 'NORMAL',
};

export default function NotificationPanel({
    isOpen, onClose, userRole, isDarkMode, onUnreadCountChange
}: NotificationPanelProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [compose, setCompose] = useState(EMPTY_COMPOSE);
    const [students, setStudents] = useState<any[]>([]);
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);

    const canSend = ['TEACHER', 'PRINCIPAL', 'ADMIN'].includes(userRole);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const result = await notificationAPI.getAll({ category: activeCategory, limit: 60 });
            if (result.success) {
                setNotifications(result.data);
                const unread = result.data.filter((n: any) => !n.isRead).length;
                onUnreadCountChange?.(unread);
            }
        } catch { }
        finally { setLoading(false); }
    }, [activeCategory]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            if (canSend && students.length === 0) {
                teacherAPI.getStudents().then(r => { if (r.success) setStudents(r.data || []); }).catch(() => { });
            }
        }
    }, [isOpen, activeCategory]);

    const markRead = async (id: string) => {
        await notificationAPI.markRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        onUnreadCountChange?.(notifications.filter(n => !n.isRead && n.id !== id).length);
    };

    const markAllRead = async () => {
        await notificationAPI.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        onUnreadCountChange?.(0);
    };

    const deleteNotif = async (id: string) => {
        await notificationAPI.delete(id);
        const updated = notifications.filter(n => n.id !== id);
        setNotifications(updated);
        onUnreadCountChange?.(updated.filter(n => !n.isRead).length);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setSendResult(null);
        try {
            const result = await notificationAPI.send(compose);
            if (result.success) {
                setSendResult({ ok: true, msg: result.message });
                setCompose(EMPTY_COMPOSE);
                setTimeout(() => { setActiveTab('inbox'); setSendResult(null); }, 2000);
            } else {
                setSendResult({ ok: false, msg: result.message || 'Failed to send' });
            }
        } catch {
            setSendResult({ ok: false, msg: 'Network error. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

            {/* Slide-over Panel */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-[460px] shadow-2xl z-50 flex flex-col
                ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>

                {/* ── Header ── */}
                <div className={`px-6 pt-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Bell className="text-indigo-600 dark:text-indigo-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black">Notifications</h2>
                                {unreadCount > 0 && (
                                    <p className="text-xs font-bold text-indigo-500">{unreadCount} unread</p>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('inbox')}
                            className={`flex-1 py-2 rounded-xl text-sm font-black transition ${activeTab === 'inbox'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            Inbox {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                        </button>
                        {canSend && (
                            <button onClick={() => setActiveTab('compose')}
                                className={`flex-1 py-2 rounded-xl text-sm font-black transition flex items-center justify-center gap-2 ${activeTab === 'compose'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                <Send size={14} /> Compose
                            </button>
                        )}
                    </div>
                </div>

                {/* ── INBOX ── */}
                {activeTab === 'inbox' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Category pills */}
                        <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} overflow-x-auto`}>
                            <div className="flex gap-2 w-max">
                                {CATEGORIES.map(cat => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition whitespace-nowrap ${activeCategory === cat
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mark all read button */}
                        {unreadCount > 0 && (
                            <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <button onClick={markAllRead}
                                    className="text-xs font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 transition">
                                    <CheckCheck size={14} /> Mark all as read
                                </button>
                            </div>
                        )}

                        {/* List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <Loader2 size={28} className="animate-spin text-indigo-500" />
                                    <p className="text-sm font-bold text-slate-400">Loading…</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Bell size={30} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="font-black text-slate-400">No notifications</p>
                                    <p className="text-sm text-slate-400">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {notifications.map(n => {
                                        const cat = CATEGORY_META[n.category] || CATEGORY_META.GENERAL;
                                        return (
                                            <div key={n.id}
                                                className={`p-4 transition ${!n.isRead
                                                    ? 'bg-indigo-50/60 dark:bg-indigo-900/10'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                                                <div className="flex gap-3">
                                                    {/* Category icon */}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg} ${cat.color}`}>
                                                        {n.iconEmoji ? <span className="text-lg">{n.iconEmoji}</span> : cat.icon}
                                                    </div>
                                                    {/* Body */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-0.5">
                                                            <p className="font-black text-sm leading-snug line-clamp-1">{n.title}</p>
                                                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{n.message}</p>
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {n.senderRole && (
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${ROLE_BADGE[n.senderRole] || 'bg-slate-500 text-white'}`}>
                                                                    {n.senderName || n.senderRole}
                                                                </span>
                                                            )}
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.bg} ${cat.color}`}>
                                                                {n.category}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 ml-auto">{timeAgo(n.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-1 flex-shrink-0">
                                                        {!n.isRead && (
                                                            <button onClick={() => markRead(n.id)} title="Mark as read"
                                                                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 text-green-500 transition">
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => deleteNotif(n.id)} title="Delete"
                                                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400 transition">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── COMPOSE ── */}
                {activeTab === 'compose' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <h3 className="text-base font-black mb-5 flex items-center gap-2">
                            <Send size={16} className="text-indigo-500" /> Send Notification
                        </h3>

                        {sendResult && (
                            <div className={`mb-4 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${sendResult.ok ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/20 text-red-600'}`}>
                                {sendResult.ok ? <Check size={16} /> : <AlertCircle size={16} />}
                                {sendResult.msg}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="space-y-4">
                            {/* Target */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Send To</label>
                                <select value={compose.targetType}
                                    onChange={e => setCompose({ ...compose, targetType: e.target.value as any, targetStudentId: '' })}
                                    className={`w-full px-4 py-3 rounded-xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <option value="ALL_STUDENTS">🎓 All Students</option>
                                    <option value="SPECIFIC_STUDENT">👤 Specific Student</option>
                                </select>
                            </div>

                            {/* Student picker */}
                            {compose.targetType === 'SPECIFIC_STUDENT' && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Student</label>
                                    <select value={compose.targetStudentId}
                                        onChange={e => setCompose({ ...compose, targetStudentId: e.target.value })}
                                        required
                                        className={`w-full px-4 py-3 rounded-xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <option value="">Select a student…</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Category + Priority row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
                                    <select value={compose.category} onChange={e => setCompose({ ...compose, category: e.target.value })}
                                        className={`w-full px-3 py-3 rounded-xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        {['GENERAL', 'ACADEMIC', 'EVENT', 'ANNOUNCEMENT', 'ATTENDANCE', 'EXAM'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Priority</label>
                                    <select value={compose.priority} onChange={e => setCompose({ ...compose, priority: e.target.value })}
                                        className={`w-full px-3 py-3 rounded-xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Title *</label>
                                <input type="text" value={compose.title} placeholder="Notification title…" required
                                    onChange={e => setCompose({ ...compose, title: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border font-bold text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message *</label>
                                <textarea rows={5} value={compose.message} placeholder="Write your message…" required
                                    onChange={e => setCompose({ ...compose, message: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                            </div>

                            <button type="submit" disabled={sending}
                                className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60">
                                {sending ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : <><Send size={18} /> Send Notification</>}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}
