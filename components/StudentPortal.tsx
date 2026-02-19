
import React, { useState } from 'react';
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
} from 'lucide-react';
import { MOCK_STUDENTS, MOCK_NOTICES } from '../constants';
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
}

const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

const StudentPortal: React.FC<StudentPortalProps> = ({ isDarkMode, activeView }) => {
  const student = MOCK_STUDENTS[0];
  const examResults = student.academicGrades || [];
  const notifications = MOCK_NOTICES.filter(n => n.target === 'All' || n.target.includes(student.class));
  const fullName = `${student.firstName} ${student.lastName}`;
  const initials = `${student.firstName[0]}${student.lastName[0]}`;
  const avgScore = examResults.length > 0
    ? Math.round(examResults.reduce((a, r) => a + r.score, 0) / examResults.length)
    : 0;

  // Build bar chart data
  const barData = examResults.map((r, i) => ({
    subject: r.subject.slice(0, 4),
    fullName: r.subject,
    score: r.score,
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';
  const chartAxisTick = { fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 'bold' as const };
  const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';

  // ── Dashboard ──
  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn">

      {/* ═══════ PROFILE BANNER ═══════ */}
      <div className={`${card} overflow-hidden`}>
        {/* Gradient accent top edge */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />

        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-xl shadow-indigo-500/20 ring-4 ring-white dark:ring-slate-800">
              {initials}
            </div>
            {/* Online dot */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse-green" />
          </div>

          {/* Student Info */}
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

          {/* Quick Stats Badges */}
          <div className="flex md:flex-col gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl">
              <Target size={14} className="text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-lg font-black text-indigo-700 dark:text-indigo-300 leading-none">{student.overallAttendance}%</p>
                <p className="text-[9px] font-bold uppercase text-indigo-400 tracking-wider">Attendance</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
              <Zap size={14} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 leading-none">{avgScore}%</p>
                <p className="text-[9px] font-bold uppercase text-emerald-400 tracking-wider">Avg Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ STAT CARDS ROW ═══════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: `${student.overallAttendance}%`, icon: CheckCircle2, color: 'bg-indigo-600', shadow: 'shadow-indigo-200 dark:shadow-none' },
          { label: 'Avg. Grade', value: 'A+', icon: TrendingUp, color: 'bg-emerald-500', shadow: 'shadow-emerald-200 dark:shadow-none' },
          { label: 'Achievements', value: `${student.achievements?.length || 0}`, icon: Award, color: 'bg-amber-500', shadow: 'shadow-amber-200 dark:shadow-none' },
          { label: 'Subjects', value: `${examResults.length}`, icon: BookOpen, color: 'bg-purple-500', shadow: 'shadow-purple-200 dark:shadow-none' },
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

        {/* Academic Trend – Area Chart */}
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

        {/* Subject Scores – Bar Chart */}
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

        {/* Achievements */}
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

        {/* Notifications */}
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Bell size={18} className="text-indigo-500" /> Notifications
            </h3>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black">
              {notifications.length} new
            </span>
          </div>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:shadow-sm transition-all">
                <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'EVENT'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  }`}>
                  {n.type === 'EVENT' ? <Calendar size={18} /> : <Bell size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100">{n.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{n.date}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">No notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Exam Reports ──
  const renderReports = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Student identity mini-banner */}
      <div className={`${card} p-5 flex items-center gap-4`}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
          {initials}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{fullName}</h3>
          <p className="text-xs text-slate-400 font-bold">Class {student.class}-{student.section} • {student.admissionNo}</p>
        </div>
        <div className="ml-auto">
          <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95">
            Download PDF
          </button>
        </div>
      </div>

      {/* Report Card Table */}
      <div className={`${card} overflow-hidden`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Examination Report Card</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Academic Year 2025-26 • Term 1</p>
        </div>
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
            {examResults.map((r, i) => {
              const pct = Math.round((r.score / r.maxScore) * 100);
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
                    <span className={`px-3 py-1 rounded-lg text-xs font-black ${r.grade.startsWith('A') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        : r.grade.startsWith('B') ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                      }`}>{r.grade}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50/50 dark:bg-slate-800/30">
            <tr>
              <td className="px-6 py-4 text-sm font-black text-slate-800 dark:text-slate-100">Total / Average</td>
              <td className="px-6 py-4 text-center text-sm font-bold text-slate-400">{examResults.reduce((a, r) => a + r.maxScore, 0)}</td>
              <td className="px-6 py-4 text-center text-sm font-black text-indigo-600 dark:text-indigo-400">{examResults.reduce((a, r) => a + r.score, 0)}</td>
              <td className="px-6 py-4 text-center text-sm font-black text-slate-600 dark:text-slate-300">{avgScore}%</td>
              <td className="px-6 py-4 text-center">
                <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-black shadow-sm">A+</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  switch (activeView) {
    case 'reports': return renderReports();
    default: return renderDashboard();
  }
};

export default StudentPortal;
