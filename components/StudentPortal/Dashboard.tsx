import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Calendar,
    Bell,
    Star,
    TrendingUp,
    Award,
    Clock,
    CheckCircle2,
    BookOpen,
    Phone,
    Droplets,
    ChevronRight,
    Trophy,
    Target,
    Zap,
    GraduationCap,
    User,
    Loader2,
    AlertCircle
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from 'recharts';
import { studentAPI } from '../../services/api';

const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

interface DashboardProps {
    isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await studentAPI.getMe();
                if (response.success) {
                    setStudent(response.data);
                } else {
                    setError(response.message || 'Failed to load profile');
                }
            } catch (err: any) {
                setError(err.message || 'Connection error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
                <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
                <p className="font-bold text-lg">Initializing Student Portal...</p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 p-8 text-center">
                <AlertCircle size={48} className="mb-4" />
                <h3 className="text-xl font-black mb-2 tracking-tight">Access Denied or Error</h3>
                <p className="font-bold text-slate-500 max-w-md">{error || 'Could not retrieve student record.'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all active:scale-95"
                >
                    RETRY CONNECTION
                </button>
            </div>
        );
    }

    const fullName = `${student.firstName} ${student.lastName}`;
    const initials = `${student.firstName[0]}${student.lastName[0]}`;
    const avgScore = student.avgPercentage || 0;

    const barData = (student.grades || []).map((r: any, i: number) => ({
        subject: r.subject.slice(0, 4).toUpperCase(),
        fullName: r.subject,
        score: r.score,
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
    }));

    const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';
    const chartAxisTick = { fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 'bold' as const };
    const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* ═══════ PROFILE BANNER ═══════ */}
            <div className={`${card} overflow-hidden`}>
                <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-xl shadow-indigo-500/20 ring-4 ring-white dark:ring-slate-800">
                            {initials}
                        </div>
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
                    </div>
                    <div className="flex-1 text-center md:text-left min-w-0">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            {fullName}
                        </h2>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 mt-2">
                            <span className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                <GraduationCap size={14} /> Class {student.class}-{student.section}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                                <User size={14} /> Roll No: {student.rollNo}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 mt-1.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                Admission: {student.admissionNo}
                            </span>
                        </div>
                    </div>
                    <div className="flex md:flex-col gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl">
                            <Target size={14} className="text-indigo-600 dark:text-indigo-400" />
                            <div>
                                <p className="text-lg font-black text-indigo-700 dark:text-indigo-300 leading-none">{avgScore}%</p>
                                <p className="text-[9px] font-bold uppercase text-indigo-400 tracking-wider">Average</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 leading-none">{student.overallAttendance || 0}%</p>
                                <p className="text-[9px] font-bold uppercase text-emerald-400 tracking-wider">Attendance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ GRADES BAR CHART ═══════ */}
            {barData.length > 0 && (
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <TrendingUp size={18} className="text-indigo-500" /> Subject Performance
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latest Results</span>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                                <XAxis dataKey="subject" tick={chartAxisTick} axisLine={false} tickLine={false} />
                                <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                    }}
                                />
                                <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={40}>
                                    {barData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ═══════ QUICK INFO CARDS ═══════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`${card} p-5`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-xl">
                            <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjects</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{(student.grades || []).length}</p>
                </div>
                <div className={`${card} p-5`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-xl">
                            <Trophy size={16} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Best Score</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {(student.grades || []).reduce((max: number, g: any) => Math.max(max, g.score || 0), 0)}%
                    </p>
                </div>
                <div className={`${card} p-5`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-xl">
                            <Award size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievements</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{(student.achievements || []).length}</p>
                </div>
                <div className={`${card} p-5`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-xl">
                            <Bell size={16} className="text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notices</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{(student.notices || []).length}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
