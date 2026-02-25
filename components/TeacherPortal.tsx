
import React, { useState, useEffect } from 'react';
import {
    Users,
    CheckSquare,
    ShieldAlert,
    PlusCircle,
    BookOpen,
    ClipboardList,
    Bell,
    Calendar,
    Target,
    Zap,
    GraduationCap,
    ChevronRight,
    TrendingUp,
    Clock,
    FileText,
    Phone,
    Mail,
    Briefcase,
    Star,
    Award,
    BarChart3,
    User,
} from 'lucide-react';
import { MOCK_STUDENTS, MOCK_TEACHERS, MOCK_NOTICES } from '../constants';
import AttendanceMarker from './AttendanceMarker';
import MarksUploader from './MarksUploader';
import StudentList from './StudentList';
import { teacherAPI, complaintAPI, notificationAPI } from '../services/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
} from 'recharts';
import { MessageSquare } from 'lucide-react';

interface TeacherPortalProps {
    isDarkMode: boolean;
    activeView: string;
    setActiveView: (view: string) => void;
}

const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// ─── Complaint Form (inner component with its own state) ───
interface ComplaintFormInnerProps {
    card: string;
    initials: string;
    fullName: string;
    employeeId: string;
    onBack: () => void;
}

const ComplaintFormInner: React.FC<ComplaintFormInnerProps> = ({ card, initials, fullName, employeeId, onBack }) => {
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Fetch real students from the API
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch('http://localhost:5000/api/v1/students?limit=200', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                });
                const json = await res.json();
                if (json.success && json.data) {
                    setStudents(json.data);
                    if (json.data.length > 0) {
                        setSelectedStudentId(json.data[0].id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch students:', err);
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudents();
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !description.trim()) {
            setError('Please select a student and enter a description.');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess(false);

        try {
            const result = await complaintAPI.create({
                studentId: selectedStudentId,
                severity,
                description: description.trim(),
            });

            if (result.success) {
                setSuccess(true);
                setDescription('');
                setSeverity('LOW');
                setTimeout(() => setSuccess(false), 4000);
            } else {
                setError(result.message || 'Failed to submit complaint');
            }
        } catch (err: any) {
            setError(err.message || 'Network error — please try again');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Mini banner */}
            <div className={`${card} p-5 flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
                    {initials}
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{fullName}</h3>
                    <p className="text-xs text-slate-400 font-bold">{employeeId}</p>
                </div>
                <button onClick={onBack} className="ml-auto text-sm text-blue-600 dark:text-blue-400 font-black hover:underline">← Dashboard</button>
            </div>

            <div className={`${card} p-10 max-w-2xl mx-auto`}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-2xl text-red-600 dark:text-red-400"><ShieldAlert size={24} /></div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Raise Student Complaint</h3>
                </div>

                {/* Success Toast */}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 animate-fadeIn">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">✓</div>
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">Complaint submitted successfully!</p>
                    </div>
                )}

                {/* Error Toast */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-black">!</div>
                        <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Select Student</label>
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            disabled={loadingStudents}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {loadingStudents ? (
                                <option>Loading students...</option>
                            ) : students.length === 0 ? (
                                <option>No students found</option>
                            ) : (
                                students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.rollNo})</option>)
                            )}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Severity</label>
                        <div className="flex gap-4">
                            {(['LOW', 'MEDIUM', 'HIGH'] as const).map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setSeverity(v)}
                                    className={`flex-1 text-center py-3 rounded-xl font-black text-[10px] cursor-pointer transition-all border ${severity === v
                                        ? v === 'HIGH'
                                            ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
                                            : v === 'MEDIUM'
                                                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                                                : 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-red-500 hover:text-white'
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200"
                            placeholder="Explain the behavior issue..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-5 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all ${submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                            }`}
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-3">
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                            </span>
                        ) : (
                            'Submit to Parent Portal'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const TeacherPortal: React.FC<TeacherPortalProps> = ({ isDarkMode, activeView, setActiveView }) => {
    const [teacherData, setTeacherData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState<'ATTENDANCE' | 'COMPLAINT' | 'MARKS' | 'DASHBOARD' | 'STUDENTS'>('DASHBOARD');
    const [dashNotifs, setDashNotifs] = useState<any[]>([]);

    // Sync sidebar navigation (activeView from Layout) → internal selectedAction
    useEffect(() => {
        const viewMap: Record<string, typeof selectedAction> = {
            attendance: 'ATTENDANCE',
            marks: 'MARKS',
            dashboard: 'DASHBOARD',
            students: 'STUDENTS',
            complaint: 'COMPLAINT',
        };
        if (activeView && viewMap[activeView]) {
            setSelectedAction(viewMap[activeView]);
        }
    }, [activeView]);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const response = await teacherAPI.getMe();
                if (response.success) {
                    setTeacherData(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch teacher profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, []);

    useEffect(() => {
        notificationAPI.getAll({ limit: 4 })
            .then(r => { if (r.success) setDashNotifs(r.data); })
            .catch(() => { });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-lg">Loading Faculty Profile...</p>
            </div>
        );
    }

    const teacher = teacherData || MOCK_TEACHERS[0];
    const students = MOCK_STUDENTS;
    const fullName = `${teacher.firstName} ${teacher.lastName}`;
    const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`;

    // Compute stats
    const totalStudents = students.length;
    const presentCount = students.filter(s => s.status === 'ACTIVE').length;
    const avgAttendance = totalStudents > 0
        ? Math.round(students.reduce((a, s) => a + (s.overallAttendance || 0), 0) / totalStudents)
        : 0;

    // Attendance distribution for pie chart
    const attendanceData = [
        { name: 'Present', value: presentCount, color: '#22c55e' },
        { name: 'Absent', value: Math.max(0, totalStudents - presentCount), color: '#ef4444' },
    ];

    // Student performance data for bar chart
    const studentPerfData = students.slice(0, 5).map((s, i) => ({
        name: `${s.firstName}`,
        attendance: s.overallAttendance || 0,
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
    }));

    const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';
    const chartAxisTick = { fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 'bold' as const };
    const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';

    const renderDashboard = () => (
        <div className="space-y-6 animate-fadeIn">

            {/* ═══════ PROFILE BANNER ═══════ */}
            <div className={`${card} overflow-hidden`}>
                <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />

                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-xl shadow-blue-500/20 ring-4 ring-white dark:ring-slate-800">
                            {initials}
                        </div>
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse-green" />
                    </div>

                    {/* Teacher Info */}
                    <div className="flex-1 text-center md:text-left min-w-0">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            {fullName}
                        </h2>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 mt-2">
                            <span className="flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400">
                                <Briefcase size={14} /> Faculty ID: {teacher.employeeId}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400">
                                <BookOpen size={14} /> {Array.isArray(teacher.subjects) ? (typeof teacher.subjects[0] === 'string' ? teacher.subjects.join(', ') : teacher.subjects.map((s: any) => s.subject).join(', ')) : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 mt-1.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                                <GraduationCap size={12} /> Classes: {Array.isArray(teacher.assignedClasses) ? teacher.assignedClasses.join(', ') : (Array.isArray(teacher.classes) ? teacher.classes.map((c: any) => c.classSection).join(', ') : 'N/A')}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                                <Phone size={12} /> {teacher.phone ? teacher.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1***$3') : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex md:flex-col gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                            <Users size={14} className="text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-lg font-black text-blue-700 dark:text-blue-300 leading-none">{totalStudents}</p>
                                <p className="text-[9px] font-bold uppercase text-blue-400 tracking-wider">Students</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
                            <Target size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 leading-none">{avgAttendance}%</p>
                                <p className="text-[9px] font-bold uppercase text-emerald-400 tracking-wider">Avg Attend</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ QUICK ACTIONS ═══════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Take Attendance', icon: CheckSquare, color: 'bg-blue-600', shadow: 'shadow-blue-200 dark:shadow-none', action: 'attendance', active: true },
                    { label: 'Upload Marks', icon: BookOpen, color: 'bg-purple-600', shadow: 'shadow-purple-200 dark:shadow-none', action: 'marks', active: false },
                    { label: 'My Students', icon: Users, color: 'bg-indigo-600', shadow: 'shadow-indigo-200 dark:shadow-none', action: 'students', active: false },
                    { label: 'Raise Complaint', icon: ShieldAlert, color: 'bg-red-500', shadow: 'shadow-red-200 dark:shadow-none', action: 'complaint', active: false },
                ].map(item => (
                    <button
                        key={item.label}
                        onClick={() => setActiveView(item.action)}
                        className={`${card} p-5 flex items-center gap-4 hover:shadow-md active:scale-[0.98] transition-all group`}
                    >
                        <div className={`${item.color} p-3 rounded-xl text-white shadow-lg ${item.shadow} group-hover:scale-110 transition-transform`}>
                            <item.icon size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* ═══════ CHARTS ROW ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student Attendance Bar Chart */}
                <div className={`${card} p-6 lg:col-span-2`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <BarChart3 size={18} className="text-blue-500" /> Student Attendance
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class Tracker</span>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentPerfData} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                                <XAxis dataKey="name" tick={chartAxisTick} axisLine={false} tickLine={false} />
                                <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}
                                    formatter={(value: number) => [`${value}%`, 'Attendance']}
                                />
                                <Bar dataKey="attendance" radius={[8, 8, 0, 0]} name="Attendance">
                                    {studentPerfData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Pie */}
                <div className={`${card} p-6`}>
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Target size={18} className="text-emerald-500" /> Today's Status
                    </h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={65}
                                    dataKey="value"
                                    paddingAngle={4}
                                    strokeWidth={0}
                                >
                                    {attendanceData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2">
                        {attendanceData.map(d => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{d.name}: {d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════ CLASS SUMMARY + NOTIFICATIONS ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Summary */}
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Users size={18} className="text-blue-500" /> Class Summary
                        </h3>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black">
                            {totalStudents} students
                        </span>
                    </div>
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scroll">
                        {students.map((s, i) => {
                            const att = s.overallAttendance || 0;
                            const attColor = att >= 90 ? 'text-emerald-500' : att >= 75 ? 'text-amber-500' : 'text-red-500';
                            const attBg = att >= 90 ? 'bg-emerald-50 dark:bg-emerald-900/20' : att >= 75 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20';
                            return (
                                <div key={s.id} className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                                            {s.rollNo}
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{s.firstName} {s.lastName}</span>
                                            <p className="text-[10px] font-bold text-slate-400">{s.admissionNo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:flex items-center gap-1.5">
                                            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${att >= 90 ? 'bg-emerald-500' : att >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${att}%` }} />
                                            </div>
                                            <span className={`text-[10px] font-black ${attColor}`}>{att}%</span>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${attBg} ${attColor}`}>
                                            {s.status === 'ACTIVE' ? 'Present' : 'Absent'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Notifications */}
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Bell size={18} className="text-indigo-500" /> Notifications & Updates
                        </h3>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black">
                            {dashNotifs.filter(n => !n.isRead).length} unread
                        </span>
                    </div>
                    <div className="space-y-3">
                        {dashNotifs.length === 0 ? (
                            <div className="text-center py-6 text-slate-400">
                                <Bell size={28} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm font-bold">No notifications yet</p>
                            </div>
                        ) : dashNotifs.map((n, i) => (
                            <div key={n.id || i} className={`flex gap-3 p-3 rounded-2xl border transition-all ${!n.isRead
                                    ? 'bg-indigo-50/60 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30'
                                    : 'bg-slate-50/80 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                                }`}>
                                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.category === 'EVENT' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                        : n.category === 'ACADEMIC' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    }`}>
                                    {n.category === 'EVENT' ? <Calendar size={16} /> : <Bell size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-1">{n.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{n.message}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {n.senderRole && (
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black text-white ${n.senderRole === 'PRINCIPAL' ? 'bg-purple-600' : n.senderRole === 'TEACHER' ? 'bg-blue-600' : 'bg-slate-500'
                                                }`}>
                                                {n.senderName || n.senderRole}
                                            </span>
                                        )}
                                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Assigned Subjects */}
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">My Subjects</h4>
                        <div className="flex flex-wrap gap-2">
                            {(Array.isArray(teacher.subjects) ? (typeof teacher.subjects[0] === 'string' ? teacher.subjects : teacher.subjects.map((s: any) => s.subject)) : []).map((sub: string, i: number) => (
                                <span key={sub} className="px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-sm" style={{ backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}>
                                    {sub}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderComplaintForm = () => {
        return <ComplaintFormInner card={card} initials={initials} fullName={fullName} employeeId={teacher.employeeId} onBack={() => setSelectedAction('DASHBOARD')} />;
    };


    if (selectedAction === 'ATTENDANCE') return (
        <div className="space-y-6 animate-fadeIn">
            <div className={`${card} p-5 flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
                    {initials}
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{fullName}</h3>
                    <p className="text-xs text-slate-400 font-bold">{teacher.employeeId} • Taking Attendance</p>
                </div>
                <button onClick={() => setActiveView('dashboard')} className="ml-auto text-sm text-blue-600 dark:text-blue-400 font-black hover:underline">← Dashboard</button>
            </div>
            <AttendanceMarker />
        </div>
    );
    if (selectedAction === 'COMPLAINT') return renderComplaintForm();
    if (selectedAction === 'MARKS') return (
        <div className="space-y-6 animate-fadeIn">
            <div className={`${card} p-5 flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-500/20">
                    {initials}
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{fullName}</h3>
                    <p className="text-xs text-slate-400 font-bold">{teacher.employeeId} • Uploading Marks</p>
                </div>
                <button onClick={() => setActiveView('dashboard')} className="ml-auto text-sm text-purple-600 dark:text-purple-400 font-black hover:underline">← Dashboard</button>
            </div>
            <MarksUploader />
        </div>
    );
    if (selectedAction === 'STUDENTS') return (
        <div className="space-y-6 animate-fadeIn">
            <div className={`${card} p-5 flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
                    <Users size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{fullName}</h3>
                    <p className="text-xs text-slate-400 font-bold">{teacher.employeeId} • My Students</p>
                </div>
                <button onClick={() => setActiveView('dashboard')} className="ml-auto text-sm text-indigo-600 dark:text-indigo-400 font-black hover:underline">← Dashboard</button>
            </div>
            <div className={card}>
                <StudentList />
            </div>
        </div>
    );

    return renderDashboard();
};

export default TeacherPortal;
