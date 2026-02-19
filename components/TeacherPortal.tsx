
import React, { useState } from 'react';
import {
   Users,
   CheckSquare,
   ShieldAlert,
   PlusCircle,
   BookOpen,
   ClipboardList,
   MessageSquare,
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

interface TeacherPortalProps {
   isDarkMode: boolean;
   activeView: string;
}

const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

const TeacherPortal: React.FC<TeacherPortalProps> = ({ isDarkMode, activeView }) => {
   const [selectedAction, setSelectedAction] = useState<'ATTENDANCE' | 'COMPLAINT' | 'MARKS' | 'DASHBOARD'>('DASHBOARD');

   const teacher = MOCK_TEACHERS[0];
   const students = MOCK_STUDENTS;
   const notifications = MOCK_NOTICES;
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
                        <BookOpen size={14} /> {teacher.subjects.join(', ')}
                     </span>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 mt-1.5">
                     <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                        <GraduationCap size={12} /> Classes: {teacher.assignedClasses.join(', ')}
                     </span>
                     <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                     <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                        <Phone size={12} /> {teacher.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1***$3')}
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
               { label: 'Take Attendance', icon: CheckSquare, color: 'bg-blue-600', shadow: 'shadow-blue-200 dark:shadow-none', action: 'ATTENDANCE' as const, active: true },
               { label: 'Upload Marks', icon: BookOpen, color: 'bg-purple-600', shadow: 'shadow-purple-200 dark:shadow-none', action: 'MARKS' as const, active: false },
               { label: 'Raise Complaint', icon: ShieldAlert, color: 'bg-red-500', shadow: 'shadow-red-200 dark:shadow-none', action: 'COMPLAINT' as const, active: false },
               { label: 'Notice Board', icon: MessageSquare, color: 'bg-emerald-500', shadow: 'shadow-emerald-200 dark:shadow-none', action: 'DASHBOARD' as const, active: false },
            ].map(item => (
               <button
                  key={item.label}
                  onClick={() => setSelectedAction(item.action)}
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class {teacher.assignedClasses[0]}</span>
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
                     <Users size={18} className="text-blue-500" /> Class Summary: {teacher.assignedClasses[0]}
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
                           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{n.date} • {n.author}</p>
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

               {/* Assigned Subjects */}
               <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">My Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                     {teacher.subjects.map((sub, i) => (
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

   const renderComplaintForm = () => (
      <div className="space-y-6 animate-fadeIn">
         {/* Mini banner */}
         <div className={`${card} p-5 flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
               {initials}
            </div>
            <div>
               <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{fullName}</h3>
               <p className="text-xs text-slate-400 font-bold">{teacher.employeeId} • {teacher.subjects.join(', ')}</p>
            </div>
            <button onClick={() => setSelectedAction('DASHBOARD')} className="ml-auto text-sm text-blue-600 dark:text-blue-400 font-black hover:underline">← Dashboard</button>
         </div>

         <div className={`${card} p-10 max-w-2xl mx-auto`}>
            <div className="flex items-center gap-4 mb-8">
               <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-2xl text-red-600 dark:text-red-400"><ShieldAlert size={24} /></div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Raise Student Complaint</h3>
            </div>
            <form className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Select Student</label>
                  <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                     {MOCK_STUDENTS.map(s => <option key={s.id}>{s.firstName} {s.lastName} ({s.rollNo})</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Severity</label>
                  <div className="flex gap-4">
                     {['LOW', 'MEDIUM', 'HIGH'].map(v => (
                        <label key={v} className="flex-1 text-center py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-black text-[10px] cursor-pointer hover:bg-red-500 hover:text-white transition-all border border-slate-200 dark:border-slate-700">
                           <input type="radio" name="sev" className="hidden" /> {v}
                        </label>
                     ))}
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Description</label>
                  <textarea className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200" placeholder="Explain the behavior issue..."></textarea>
               </div>
               <button className="w-full py-5 bg-red-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 active:scale-[0.98] transition-all">Submit to Parent Portal</button>
            </form>
         </div>
      </div>
   );

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
            <button onClick={() => setSelectedAction('DASHBOARD')} className="ml-auto text-sm text-blue-600 dark:text-blue-400 font-black hover:underline">← Dashboard</button>
         </div>
         <AttendanceMarker />
      </div>
   );
   if (selectedAction === 'COMPLAINT') return renderComplaintForm();

   return renderDashboard();
};

export default TeacherPortal;
