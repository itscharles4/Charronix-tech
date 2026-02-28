
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
  ChevronLeft,
  Trophy,
  Target,
  Zap,
  GraduationCap,
  User,
  Download,
  Filter,
  CheckCheck,
  AlertCircle,
  Megaphone,
  PartyPopper,
  Info,
  Loader2,
} from 'lucide-react';
import { MOCK_STUDENTS, MOCK_NOTICES } from '../constants';
import { studentAPI, notificationAPI } from '../services/api';
import Timetable from './Timetable';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Assignments from './StudentPortal/Assignments.tsx';
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

interface StudentPortalProps {
  isDarkMode: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
}

const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const StudentPortal: React.FC<StudentPortalProps> = ({ isDarkMode, activeView, setActiveView }) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Attendance state ──
  const now = new Date();
  const [attYear, setAttYear] = useState(now.getFullYear());
  const [attMonth, setAttMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attLoading, setAttLoading] = useState(false);

  // ── Notifications state (dedicated view) ──
  const [liveNotices, setLiveNotices] = useState<any[]>([]);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'ACADEMIC' | 'EVENT' | 'GENERAL'>('ALL');
  const [notifLoading, setNotifLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // ── Dashboard notification preview state ──
  const [dashNotifs, setDashNotifs] = useState<any[]>([]);
  const [dashNotifsLoaded, setDashNotifsLoaded] = useState(false);

  // ── Grades state ──
  const [liveGrades, setLiveGrades] = useState<any[]>([]);
  const [gradesSummary, setGradesSummary] = useState<any>(null);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  const portalRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const attendanceRef = useRef<HTMLDivElement>(null);

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await studentAPI.getMe();
        if (res.success) {
          setStudent(res.data);
        } else {
          setError(res.message || 'Failed to load profile');
        }
      } catch (err: any) {
        setError(err.message || 'Connection error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch dashboard notification preview (3 most recent)
  useEffect(() => {
    if (dashNotifsLoaded) return;
    notificationAPI.getAll({ limit: 3 }).then(r => {
      if (r.success) setDashNotifs(r.data);
    }).catch(() => { }).finally(() => setDashNotifsLoaded(true));
  }, []);

  // Fetch attendance when month changes
  useEffect(() => {
    if (activeView !== 'attendance') return;
    const fetchAttendance = async () => {
      setAttLoading(true);
      try {
        const res = await studentAPI.getAttendance(attYear, attMonth);
        setAttendanceData(res.success ? (res.data.attendance || []) : []);
      } catch {
        setAttendanceData([]);
      } finally {
        setAttLoading(false);
      }
    };
    fetchAttendance();
  }, [activeView, attYear, attMonth]);

  // Fetch notifications
  useEffect(() => {
    if (activeView !== 'notifications') return;
    const fetchNotices = async () => {
      setNotifLoading(true);
      try {
        const result = await notificationAPI.getAll({ category: notifFilter === 'ALL' ? undefined : notifFilter, limit: 100 });
        setLiveNotices(result.success ? (result.data || []) : []);
      } catch {
        setLiveNotices([]);
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotices();
  }, [activeView, notifFilter]);

  // Fetch grades when reports view is active or term changes
  useEffect(() => {
    if (activeView !== 'reports') return;
    const fetchGrades = async () => {
      setGradesLoading(true);
      try {
        const res = await studentAPI.getGrades(selectedTerm, '2025-26');
        if (res.success) {
          setLiveGrades(res.data.grades || []);
          setGradesSummary(res.data.summary || null);
        } else {
          setLiveGrades([]);
          setGradesSummary(null);
        }
      } catch {
        setLiveGrades([]);
        setGradesSummary(null);
      } finally {
        setGradesLoading(false);
      }
    };
    fetchGrades();
  }, [activeView, selectedTerm]);

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
        <h3 className="text-xl font-black mb-2 tracking-tight">Access Error</h3>
        <p className="font-bold text-slate-500 max-w-md">{error || 'Could not retrieve student record.'}</p>
        <button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all active:scale-95">
          RETRY
        </button>
      </div>
    );
  }

  const examResults = student.academicGrades || student.grades || [];
  const notifications = (student.notices || []).concat(MOCK_NOTICES.filter(n => n.target === 'All' || n.target.includes(student.class)));
  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
  const initials = `${(student.firstName || '?')[0]}${(student.lastName || '?')[0]}`.toUpperCase();
  const avgScore = examResults.length > 0
    ? Math.round(examResults.reduce((a: number, r: any) => a + (Number(r.score) || 0), 0) / examResults.length)
    : 0;

  // Build bar chart data
  const barData = examResults.map((r: any, i: number) => ({
    subject: (r.subject || 'SUBJ').slice(0, 4).toUpperCase(),
    fullName: r.subject || 'Unknown Subject',
    score: Number(r.score) || 0,
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';
  const chartAxisTick = { fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 'bold' as const };
  const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';

  const downloadPDF = async (elementId: string, filename: string) => {
    try {
      const el = document.getElementById(elementId);
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', scale: 2, useCORS: true });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(filename);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Failed to generate PDF');
    }
  };

  // ── Attendance helpers ──
  const getAttendanceMap = (): Record<number, string> => {
    const map: Record<number, string> = {};
    if (!Array.isArray(attendanceData)) return map;
    attendanceData.forEach((rec: any) => {
      if (!rec.date) return;
      const d = new Date(rec.date);
      if (d.getMonth() + 1 === attMonth && d.getFullYear() === attYear) {
        map[d.getDate()] = (rec.status || '').toUpperCase();
      }
    });
    return map;
  };

  const buildCalendar = () => {
    const firstDay = new Date(attYear, attMonth - 1, 1);
    const lastDay = new Date(attYear, attMonth, 0);
    const totalDays = lastDay.getDate();
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // Convert to Mon=0

    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = new Array(startDow).fill(null);
    for (let d = 1; d <= totalDays; d++) {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return weeks;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-400 dark:bg-emerald-500';
      case 'ABSENT': return 'bg-red-400 dark:bg-red-500';
      case 'LATE': return 'bg-amber-400 dark:bg-amber-500';
      case 'LEAVE': return 'bg-purple-300 dark:bg-purple-400';
      default: return '';
    }
  };

  const statusTextColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30';
      case 'ABSENT': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30';
      case 'LATE': return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30';
      case 'LEAVE': return 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30';
      default: return 'text-slate-400';
    }
  };

  const prevMonth = () => {
    if (attMonth === 1) { setAttMonth(12); setAttYear(attYear - 1); }
    else setAttMonth(attMonth - 1);
  };
  const nextMonth = () => {
    if (attMonth === 12) { setAttMonth(1); setAttYear(attYear + 1); }
    else setAttMonth(attMonth + 1);
  };

  // No longer needed - using reusable downloadPDF

  // ──────────────────────────────
  //  DASHBOARD
  // ──────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn" id="dashboard-report">

      {/* ═══════ PROFILE BANNER ═══════ */}
      <div className={`${card} overflow-hidden`}>
        <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-xl shadow-indigo-500/20 ring-4 ring-white dark:ring-slate-800">
              {initials}
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse-green" />
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
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400">
                <User size={14} /> Roll #{student.rollNo}
              </span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400">
                <FileText size={14} /> {student.admissionNo}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                <Phone size={12} /> Parent: {student.parentPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1***$3')}
              </span>
              {student.medicalInfo?.bloodGroup && (
                <>
                  <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 dark:text-red-400">
                    <Droplets size={12} /> {student.medicalInfo.bloodGroup}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex md:flex-col gap-3 flex-shrink-0">
            <button
              onClick={() => downloadPDF('dashboard-report', `${student.firstName}_Profile_Summary.pdf`)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Download size={14} /> Download Summary
            </button>
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl">
              <Target size={14} className="text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-lg font-black text-indigo-700 dark:text-indigo-300 leading-none">{student.attendance?.percentage || student.overallAttendance || 0}%</p>
                <p className="text-[9px] font-bold uppercase text-indigo-400 tracking-wider">Attendance</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
              <Zap size={14} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 leading-none">{student.avgPercentage || avgScore}%</p>
                <p className="text-[9px] font-bold uppercase text-emerald-400 tracking-wider">Avg Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ STAT CARDS ROW ═══════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: `${student.attendance?.percentage || student.overallAttendance || 0}%`, icon: CheckCircle2, color: 'bg-indigo-600', shadow: 'shadow-indigo-200 dark:shadow-none' },
          { label: 'Avg. Grade', value: student.avgGrade || 'N/A', icon: TrendingUp, color: 'bg-emerald-500', shadow: 'shadow-emerald-200 dark:shadow-none' },
          { label: 'Achievements', value: `${student.achievements?.length || student.achievementCount || 0}`, icon: Award, color: 'bg-amber-500', shadow: 'shadow-amber-200 dark:shadow-none' },
          { label: 'Subjects', value: `${examResults.length || student.subjectCount || 0}`, icon: BookOpen, color: 'bg-purple-500', shadow: 'shadow-purple-200 dark:shadow-none' },
        ].map(stat => (
          <div key={stat.label} className={`${card} p-5 flex items-center gap-4 hover:shadow-md transition-all`}>
            <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg ${stat.shadow}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════ CHARTS + ACHIEVEMENTS ROW ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${card} p-6 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Academic Performance</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score Trend</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={examResults}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="subject" tick={chartAxisTick} axisLine={false} tickLine={false} />
                <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#scoreGrad)" strokeWidth={3} dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: isDarkMode ? '#0f172a' : '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`${card} p-6`}>
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-4">Subject Scores</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                <XAxis type="number" tick={chartAxisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis dataKey="subject" type="category" tick={chartAxisTick} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  formatter={(value: number, _: string, props: any) => [`${value}/100`, props.payload.fullName]}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} name="Score">
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══════ ACHIEVEMENTS + NOTIFICATIONS ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" /> Achievements
            </h3>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-black">
              {student.achievements?.length || 0} badges
            </span>
          </div>
          <div className="space-y-3">
            {student.achievements && student.achievements.length > 0 ? (
              student.achievements.map((ach, i) => (
                <div key={ach.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-900/10 dark:to-transparent border border-amber-100 dark:border-amber-900/30 hover:shadow-sm transition-all">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200 dark:shadow-none flex-shrink-0">
                    <Star size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{ach.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{ach.category}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[10px] font-bold text-slate-400">{ach.date}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Award size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">No achievements yet</p>
              </div>
            )}
          </div>
        </div>
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Bell size={18} className="text-indigo-500" /> Notifications
            </h3>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black">
              {dashNotifs.filter(n => !n.isRead).length} unread
            </span>
          </div>
          <div className="space-y-3">
            {dashNotifs.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">No notifications</p>
              </div>
            ) : dashNotifs.map((n, i) => (
              <div key={n.id || i} className={`flex gap-3 p-3 rounded-2xl border transition-all ${!n.isRead
                ? 'bg-indigo-50/60 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30'
                : 'bg-slate-50/80 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                }`}>
                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.category === 'EVENT' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
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
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${n.senderRole === 'PRINCIPAL' ? 'bg-purple-600 text-white'
                        : n.senderRole === 'TEACHER' ? 'bg-blue-600 text-white'
                          : 'bg-slate-500 text-white'
                        }`}>
                        {n.senderName || n.senderRole}
                      </span>
                    )}
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto" />}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setActiveView('notifications')}
              className="w-full py-2.5 rounded-xl text-xs font-black text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition text-center flex items-center justify-center gap-1"
            >
              View All Notifications <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────
  //  EXAM REPORTS
  // ──────────────────────────────
  const renderReports = () => {
    const terms = ['Term 1', 'Term 2', 'Midterm', 'Final'];
    const displayGrades = liveGrades.length > 0 ? liveGrades : (examResults || []);
    const totalMax = gradesSummary?.totalMaxScore ?? displayGrades.reduce((a: number, r: any) => a + (r.maxScore || 100), 0);
    const totalScore2 = gradesSummary?.totalScore ?? displayGrades.reduce((a: number, r: any) => a + (Number(r.score) || 0), 0);
    const overallPct = gradesSummary?.percentage ?? (totalMax > 0 ? Math.round((totalScore2 / totalMax) * 100) : 0);
    const overallGrade = gradesSummary?.overallGrade ?? 'N/A';

    return (
      <div className="space-y-6 animate-fadeIn" id="exam-report">
        {/* Student header */}
        <div className={`${card} p-5 flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{fullName}</h3>
            <p className="text-xs text-slate-400 font-bold">Class {student.class}-{student.section} • {student.admissionNo}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => downloadPDF('exam-report', `${student.firstName}_Exam_Report.pdf`)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Term selector */}
        <div className={`${card} p-4 flex gap-2 flex-wrap`}>
          {terms.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTerm(t)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition ${selectedTerm === t
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grades table */}
        <div className={`${card} overflow-hidden`}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Examination Report Card</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Academic Year 2025-26 • {selectedTerm}</p>
            </div>
            {!gradesLoading && displayGrades.length > 0 && (
              <div className="text-right">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{overallPct}%</div>
                <div className="text-xs text-slate-400 font-bold">Overall • {overallGrade}</div>
              </div>
            )}
          </div>

          {gradesLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 size={24} className="animate-spin" />
              <span className="font-bold">Loading grades...</span>
            </div>
          ) : displayGrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText size={48} className="mb-4 opacity-30" />
              <p className="font-bold">No grades available for {selectedTerm}</p>
              <p className="text-sm mt-1">Marks will appear here once uploaded by your teacher.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                  <th className="px-6 py-3.5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Max</th>
                  <th className="px-6 py-3.5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Obtained</th>
                  <th className="px-6 py-3.5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">%</th>
                  <th className="px-6 py-3.5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayGrades.map((r: any, i: number) => {
                  const pct = r.percentage ?? Math.round((r.score / r.maxScore) * 100);
                  const barColor = pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-indigo-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100">{r.subject}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-400 font-bold">{r.maxScore}</td>
                      <td className="px-6 py-4 text-center text-sm font-black text-indigo-600 dark:text-indigo-400">{r.score}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${(r.grade || '').startsWith('A') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                          : (r.grade || '').startsWith('B') ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                          }`}>{r.grade || 'N/A'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50/50 dark:bg-slate-800/30">
                <tr>
                  <td className="px-6 py-4 text-sm font-black text-slate-800 dark:text-slate-100">Total / Average</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-400">{totalMax}</td>
                  <td className="px-6 py-4 text-center text-sm font-black text-indigo-600 dark:text-indigo-400">{totalScore2}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-black ${overallPct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : overallPct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                      {overallPct}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-sm font-black">{overallGrade}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    );
  };


  // ──────────────────────────────
  //  MY ATTENDANCE (NEW)
  // ──────────────────────────────
  const renderAttendance = () => {
    const attMap = getAttendanceMap();
    const weeks = buildCalendar();
    const present = Object.values(attMap).filter(s => s === 'PRESENT').length;
    const absent = Object.values(attMap).filter(s => s === 'ABSENT').length;
    const late = Object.values(attMap).filter(s => s === 'LATE').length;
    const totalMarked = Object.keys(attMap).length;
    const pct = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;
    const isCurrentMonth = attYear === now.getFullYear() && attMonth === now.getMonth() + 1;

    return (
      <div className="space-y-6 animate-fadeIn" id="attendance-report">

        {/* Header */}
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">My Attendance</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Academic Year 2025-26</p>
            </div>
            <button
              onClick={() => downloadPDF('attendance-report', `${student.firstName}_Attendance_${MONTH_NAMES[attMonth - 1]}.pdf`)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Days', value: totalMarked, icon: Calendar, color: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-700 dark:text-slate-200', labelColor: 'text-slate-500' },
            { label: 'Present', value: present, icon: CheckCircle2, color: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-700 dark:text-emerald-300', labelColor: 'text-emerald-500' },
            { label: 'Absent', value: absent, icon: AlertCircle, color: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-300', labelColor: 'text-red-500' },
            { label: 'Late', value: late, icon: Clock, color: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-700 dark:text-amber-300', labelColor: 'text-amber-500' },
            { label: 'Attendance %', value: totalMarked > 0 ? `${pct}%` : 'N/A', icon: Target, color: pct >= 75 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20', textColor: pct >= 75 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300', labelColor: pct >= 75 ? 'text-emerald-500' : 'text-red-500' },
          ].map(stat => (
            <div key={stat.label} className={`${card} p-4 flex items-center gap-3`}>
              <div className={`${stat.color} p-2.5 rounded-xl`}>
                <stat.icon size={18} className={stat.labelColor} />
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${stat.labelColor}`}>{stat.label}</p>
                <h3 className={`text-xl font-black ${stat.textColor}`}>{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
              {MONTH_NAMES[attMonth - 1]} {attYear}
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ChevronLeft size={20} className="text-slate-500" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" disabled={isCurrentMonth}>
                <ChevronRight size={20} className={isCurrentMonth ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500'} />
              </button>
            </div>
          </div>

          {attLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-2 mb-2">
                  {week.map((day, di) => {
                    if (day === null) return <div key={di} />;
                    const status = attMap[day];
                    const isToday = day === now.getDate() && isCurrentMonth;
                    const isSaturday = di === 5;
                    const isSunday = di === 6;
                    const isWeekend = isSaturday || isSunday;

                    return (
                      <div
                        key={di}
                        className={`relative flex items-center justify-center h-12 rounded-xl text-sm font-bold transition-all
                          ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
                          ${isWeekend && !status ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400' : ''}
                          ${!isWeekend && !status ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300' : ''}
                          ${status === 'PRESENT' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : ''}
                          ${status === 'ABSENT' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : ''}
                          ${status === 'LATE' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : ''}
                          ${status === 'LEAVE' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' : ''}
                        `}
                      >
                        {day}
                        {status && (
                          <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${statusColor(status)}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {[
                  { label: 'Present', color: 'bg-emerald-400' },
                  { label: 'Absent', color: 'bg-red-400' },
                  { label: 'Late', color: 'bg-amber-400' },
                  { label: 'Leave', color: 'bg-purple-300' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Attendance History Table */}
        {attendanceData.length > 0 && (
          <div className={`${card} overflow-hidden`}>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Attendance History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                    <th className="px-6 py-3 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Marked By</th>
                    <th className="px-6 py-3 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(Array.isArray(attendanceData) ? attendanceData : []).slice(0, 15).map((rec: any, i: number) => {
                    const d = rec.date ? new Date(rec.date) : new Date();
                    const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                    const status = (rec.status || '').toUpperCase();
                    return (
                      <tr key={rec.id || i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">{dateStr}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-3 py-1 rounded-lg text-xs font-black ${statusTextColor(status)}`}>{status}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-500">{rec.markedBy?.firstName ? `${rec.markedBy.firstName} ${rec.markedBy.lastName || ''}` : '-'}</td>
                        <td className="px-6 py-3 text-sm text-slate-400">{rec.remarks || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ──────────────────────────────
  //  NOTIFICATIONS (NEW)
  // ──────────────────────────────
  const renderNotifications = () => {
    const filterTabs = [
      { key: 'ALL' as const, label: 'All', icon: Filter },
      { key: 'ACADEMIC' as const, label: 'Academic', icon: BookOpen },
      { key: 'EVENT' as const, label: 'Events', icon: PartyPopper },
      { key: 'GENERAL' as const, label: 'Announcements', icon: Megaphone },
    ];

    const filteredNotices = notifFilter === 'ALL'
      ? liveNotices
      : liveNotices.filter((n: any) => (n.type || '').toUpperCase() === notifFilter);

    // Group by relative date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: { label: string; items: any[] }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'This Week', items: [] },
      { label: 'Older', items: [] },
    ];

    filteredNotices.forEach((n: any) => {
      const d = new Date(n.createdAt || n.date || Date.now());
      d.setHours(0, 0, 0, 0);
      if (d >= today) groups[0].items.push(n);
      else if (d >= yesterday) groups[1].items.push(n);
      else if (d >= weekAgo) groups[2].items.push(n);
      else groups[3].items.push(n);
    });

    const getNotifIcon = (cat: string) => {
      switch ((cat || '').toUpperCase()) {
        case 'EVENT': return <PartyPopper size={18} />;
        case 'ACADEMIC': return <BookOpen size={18} />;
        case 'ATTENDANCE': return <CheckCheck size={18} />;
        case 'EXAM': return <AlertCircle size={18} />;
        default: return <Info size={18} />;
      }
    };

    const getNotifColors = (cat: string) => {
      switch ((cat || '').toUpperCase()) {
        case 'EVENT': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
        case 'ACADEMIC': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
        case 'ATTENDANCE': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
        case 'EXAM': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
        default: return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      }
    };

    const getRoleBadge = (role: string, name: string) => {
      const color = role === 'PRINCIPAL' ? 'bg-purple-600' : role === 'TEACHER' ? 'bg-blue-600' : 'bg-slate-500';
      return <span className={`px-2 py-0.5 rounded text-[9px] font-black text-white ${color}`}>{name || role}</span>;
    };

    const getPriorityBadge = (priority: string) => {
      switch ((priority || '').toUpperCase()) {
        case 'HIGH': return <span className="px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[9px] font-black uppercase">Urgent</span>;
        case 'MEDIUM': return <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase">Important</span>;
        default: return null;
      }
    };

    const markAllRead = async () => {
      try { await notificationAPI.markAllRead(); } catch { }
      setLiveNotices(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
      <div className="space-y-6 animate-fadeIn">

        {/* Header */}
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <Bell size={22} className="text-indigo-500" /> Notifications
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-1">{filteredNotices.length} notifications</p>
            </div>
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-4 py-2 rounded-xl transition-colors"
            >
              <CheckCheck size={16} /> Mark All Read
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setNotifFilter(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all
                ${notifFilter === tab.key
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {notifLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className={`${card} p-12 text-center`}>
            <Bell size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-slate-500 dark:text-slate-400">No notifications found</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for updates</p>
          </div>
        ) : (
          groups.filter(g => g.items.length > 0).map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{group.label}</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="space-y-3">
                {group.items.map((n: any, i: number) => {
                  const isRead = n.isRead || readIds.has(n.id);
                  const dateStr = new Date(n.createdAt || n.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  const category = n.category || n.type || 'GENERAL';
                  return (
                    <div
                      key={n.id || i}
                      onClick={async () => {
                        if (!isRead) {
                          try { await notificationAPI.markRead(n.id); } catch { }
                          setLiveNotices(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                        }
                      }}
                      className={`${card} p-5 flex gap-4 cursor-pointer hover:shadow-md transition-all
                          ${!isRead ? 'border-l-4 border-l-indigo-500' : 'opacity-75'}
                        `}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotifColors(category)}`}>
                        {getNotifIcon(category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-black ${isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                            {n.title}
                          </p>
                          {!isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                          {getPriorityBadge(n.priority)}
                        </div>
                        {n.message && n.message !== n.title && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {n.senderRole && getRoleBadge(n.senderRole, n.senderName)}
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${getNotifColors(category)}`}>
                            {category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dateStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // ──────────────────────────────
  //  MY TIMETABLE
  // ──────────────────────────────
  const renderTimetable = () => (
    <div className="space-y-6 animate-fadeIn">
      <Timetable isDarkMode={isDarkMode} />
    </div>
  );

  // ──────────────────────────────
  //  ROUTING
  // ──────────────────────────────
  switch (activeView) {
    case 'reports': return renderReports();
    case 'attendance': return renderAttendance();
    case 'notifications': return renderNotifications();
    case 'timetable': return renderTimetable();
    case 'assignments': return (
      <div className="space-y-6 animate-fadeIn">
        <div className={`${card} p-5 flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{fullName}</h3>
            <p className="text-xs text-slate-400 font-bold">Class {student.class}-{student.section} • My Homework</p>
          </div>
          <button onClick={() => setActiveView('dashboard')} className="ml-auto text-sm text-indigo-600 dark:text-indigo-400 font-black hover:underline">← Dashboard</button>
        </div>
        <Assignments />
      </div>
    );
    default: return renderDashboard();
  }
};

export default StudentPortal;
