import React, { useState, useEffect } from 'react';
import {
   Users, CheckCircle2, AlertTriangle, TrendingUp, ShieldAlert,
   Award, Stethoscope, ChevronRight, GraduationCap, Target,
   LayoutDashboard, BarChart3, MessageSquareWarning, CalendarDays,
   ChevronLeft, RefreshCw, Mail, Phone, BookOpen, Star,
   AlertCircle, Clock, CheckCheck, XCircle, Loader2, CreditCard
} from 'lucide-react';
import { parentAPI } from '../services/api';
import FeeDashboard from './ParentPortal/FeeDashboard';

interface ParentPortalProps {
   isDarkMode: boolean;
   activeView: string;
   setActiveView: (view: string) => void;
}

const ParentPortal: React.FC<ParentPortalProps> = ({ isDarkMode, activeView, setActiveView }) => {
   const [parentData, setParentData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [selectedChildIndex, setSelectedChildIndex] = useState(0);
   const [attendanceMonth, setAttendanceMonth] = useState(new Date());

   useEffect(() => {
      const fetchParentData = async () => {
         try {
            const response = await parentAPI.getMe();
            if (response.success) setParentData(response.data);
         } catch (err) {
            console.error('Failed to fetch parent data:', err);
         } finally {
            setLoading(false);
         }
      };
      fetchParentData();
   }, []);

   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 size={48} className="animate-spin text-indigo-600" />
            <p className="font-black text-lg text-indigo-600/60 uppercase tracking-widest">Loading Guardian Portal...</p>
         </div>
      );
   }

   const children = parentData?.children || [];

   if (children.length === 0) {
      return (
         <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
               <Users size={48} className="text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white">No Children Linked</h3>
            <p className="text-slate-500 mt-4 max-w-md mx-auto">No student records associated with <span className="text-indigo-600 font-bold">{parentData?.user?.email}</span></p>
         </div>
      );
   }

   const child = children[selectedChildIndex];
   const card = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl transition-all duration-300';

   // ── HELPERS ──────────────────────────────────────────────────────────────
   const getGradeLetter = (score: number, max: number): string => {
      const pct = (score / max) * 100;
      if (pct >= 90) return 'A+';
      if (pct >= 80) return 'A';
      if (pct >= 70) return 'B+';
      if (pct >= 60) return 'B';
      if (pct >= 50) return 'C';
      return 'F';
   };

   const getGradeColor = (grade: string) => {
      if (grade.startsWith('A')) return 'from-emerald-500 to-green-600';
      if (grade.startsWith('B')) return 'from-indigo-500 to-blue-600';
      if (grade.startsWith('C')) return 'from-amber-500 to-yellow-600';
      return 'from-red-500 to-red-700';
   };

   const getSeverityColor = (sev: string) => {
      if (sev === 'HIGH') return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700', dot: 'bg-red-500' };
      if (sev === 'MEDIUM') return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700', dot: 'bg-amber-500' };
      return { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-700', dot: 'bg-indigo-500' };
   };

   const getStatusColor = (status: string) => {
      switch (status?.toUpperCase()) {
         case 'PRESENT': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300';
         case 'ABSENT': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
         case 'LATE': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300';
         case 'LEAVE': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
         default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
      }
   };

   const getStatusIcon = (status: string) => {
      switch (status?.toUpperCase()) {
         case 'PRESENT': return '🟢';
         case 'ABSENT': return '🔴';
         case 'LATE': return '🟡';
         case 'LEAVE': return '⚪';
         default: return '⬜';
      }
   };

   // ─── ATTENDANCE CALENDAR helpers ─────────────────────────────────────────
   const attendanceMap = new Map<string, any>();
   (child.attendance || []).forEach((r: any) => {
      const dateStr = new Date(r.date).toISOString().split('T')[0];
      attendanceMap.set(dateStr, r);
   });

   const calYear = attendanceMonth.getFullYear();
   const calMonth = attendanceMonth.getMonth();
   const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
   const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Mon=0

   const monthRecords = (child.attendance || []).filter((r: any) => {
      const d = new Date(r.date);
      return d.getFullYear() === calYear && d.getMonth() === calMonth;
   });
   const presentCount = monthRecords.filter((r: any) => r.status === 'PRESENT').length;
   const absentCount = monthRecords.filter((r: any) => r.status === 'ABSENT').length;
   const lateCount = monthRecords.filter((r: any) => r.status === 'LATE').length;
   const leaveCount = monthRecords.filter((r: any) => r.status === 'LEAVE').length;
   const totalMarked = monthRecords.length;
   const attendancePct = totalMarked > 0 ? Math.round(((presentCount + lateCount) / totalMarked) * 100) : 0;

   // ─── CHILD SELECTOR HEADER ───────────────────────────────────────────────
   const ChildHeader = () => (
      <div className={`${card} p-5 flex flex-col sm:flex-row items-center justify-between gap-4`}>
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg">
               <ShieldAlert size={24} />
            </div>
            <div>
               <h3 className="text-lg font-black text-slate-800 dark:text-white">Guardian Portal</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{parentData?.user?.email}</p>
            </div>
         </div>
         {children.length > 1 && (
            <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl gap-1">
               {children.map((c: any, i: number) => (
                  <button
                     key={c.id}
                     onClick={() => setSelectedChildIndex(i)}
                     className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${i === selectedChildIndex ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                     {c.firstName}
                  </button>
               ))}
            </div>
         )}
      </div>
   );

   // ─── VIEW: OVERVIEW ──────────────────────────────────────────────────────
   const renderOverview = () => (
      <div className="space-y-6 animate-fadeIn">
         <ChildHeader />

         {/* Hero Banner */}
         <div className="bg-slate-900 dark:bg-black rounded-3xl text-white p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -ml-48 -mb-48" />

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full lg:w-auto text-center md:text-left">
               <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-4xl shadow-2xl border-4 border-white/10">
                     {child.firstName[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-4 border-slate-900 flex items-center justify-center">
                     <CheckCircle2 size={14} className="text-white" />
                  </div>
               </div>
               <div>
                  <h2 className="text-4xl font-black tracking-tight">{child.firstName} {child.lastName}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                     <span className="bg-white/10 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/10">
                        <GraduationCap size={12} className="text-indigo-400" /> Grade {child.class}-{child.section}
                     </span>
                     <span className="bg-white/10 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/10">
                        <Target size={12} className="text-purple-400" /> Roll No: {child.rollNo}
                     </span>
                     <span className="bg-white/10 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/10">
                        <Mail size={12} className="text-sky-400" /> {child.admissionNo}
                     </span>
                     <span className="bg-emerald-500/20 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> {child.status}
                     </span>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 relative z-10 w-full lg:w-auto">
               {[
                  { label: 'Attendance', value: `${child.attendancePercentage}%`, sub: 'This Month', color: 'text-indigo-400', hasBar: true, barVal: child.attendancePercentage },
                  { label: 'Blood Group', value: child.medicalInfo?.bloodGroup || 'N/A', sub: 'Medical Safe', color: 'text-purple-400' },
                  { label: 'Parent', value: child.parentName, sub: child.parentPhone, color: 'text-sky-400', small: true },
               ].map((stat, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-center flex-1 min-w-[130px] hover:scale-105 transition-transform duration-300">
                     <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${stat.color} mb-2`}>{stat.label}</p>
                     <p className={`font-black leading-none ${stat.small ? 'text-base mt-2' : 'text-4xl'}`}>{stat.value}</p>
                     {stat.hasBar && (
                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                           <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${stat.barVal}%` }} />
                        </div>
                     )}
                     <p className="text-[9px] text-white/30 uppercase tracking-widest mt-2 font-bold">{stat.sub}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Quick Action Buttons */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
               { label: 'Academic Reports', icon: BarChart3, view: 'reports', color: 'from-indigo-500 to-blue-600', desc: `${child.academicGrades?.length || 0} grade records` },
               { label: 'Disciplinary Logs', icon: MessageSquareWarning, view: 'complaints', color: 'from-red-500 to-rose-600', desc: `${child.complaints?.length || 0} incidents` },
               { label: 'Attendance Calendar', icon: CalendarDays, view: 'attendance', color: 'from-emerald-500 to-teal-600', desc: `${child.attendancePercentage}% this month` },
               { label: 'Fee Management', icon: CreditCard, view: 'fees', color: 'from-amber-500 to-orange-600', desc: 'Pay school fees online' },
            ].map((item) => (
               <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={`bg-gradient-to-br ${item.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left group`}
               >
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <item.icon size={20} />
                     </div>
                     <ChevronRight size={20} className="opacity-60 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="font-black text-lg">{item.label}</p>
                  <p className="text-white/70 text-xs font-bold mt-1">{item.desc}</p>
               </button>
            ))}
         </div>

         {/* Bottom Grid: Recent Grades + Achievements */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Grades */}
            <div className={`${card} p-6`}>
               <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3">
                     <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600"><TrendingUp size={20} /></div>
                     Academic Performance
                  </h3>
                  <button onClick={() => setActiveView('reports')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                     All Grades <ChevronRight size={12} />
                  </button>
               </div>
               <div className="space-y-3">
                  {child.academicGrades?.slice(0, 5).map((g: any, i: number) => {
                     const grade = g.grade || getGradeLetter(Number(g.score), Number(g.maxScore));
                     return (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center font-black text-indigo-600 text-xs border border-indigo-100 dark:border-slate-600">
                                 {g.subject.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-800 dark:text-white">{g.subject}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{g.term}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <p className="text-lg font-black text-slate-800 dark:text-white">{Math.round((Number(g.score) / Number(g.maxScore)) * 100)}%</p>
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getGradeColor(grade)} flex items-center justify-center text-white font-black text-xs shadow-md`}>
                                 {grade}
                              </div>
                           </div>
                        </div>
                     );
                  })}
                  {(!child.academicGrades || child.academicGrades.length === 0) && (
                     <div className="text-center py-10 text-slate-400">
                        <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-xs font-bold uppercase tracking-widest">No grades recorded yet</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Achievements */}
            <div className={`${card} p-6`}>
               <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3">
                     <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600"><Award size={20} /></div>
                     Elite Achievements
                  </h3>
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-xl">
                     {child.achievements?.length || 0} total
                  </span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  {child.achievements?.slice(0, 6).map((a: any, i: number) => (
                     <div key={i} className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center gap-3 hover:shadow-md transition-all">
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow text-amber-500 flex-shrink-0">
                           <Award size={16} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-xs font-black text-amber-800 dark:text-amber-400 truncate">{a.title}</p>
                           <p className="text-[9px] font-bold text-amber-600/60 uppercase tracking-widest">{a.category}</p>
                        </div>
                     </div>
                  ))}
                  {(!child.achievements || child.achievements.length === 0) && (
                     <div className="col-span-2 text-center py-10 text-slate-400">
                        <Star size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-xs font-bold uppercase tracking-widest">No achievements yet</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );

   // ─── VIEW: REPORTS ───────────────────────────────────────────────────────
   const renderReports = () => {
      const grades = child.academicGrades || [];
      const termGroups: Record<string, any[]> = {};
      grades.forEach((g: any) => {
         const key = `${g.academicYear} — ${g.term}`;
         if (!termGroups[key]) termGroups[key] = [];
         termGroups[key].push(g);
      });

      const overallAvg = grades.length > 0
         ? Math.round(grades.reduce((sum: number, g: any) => sum + (Number(g.score) / Number(g.maxScore)) * 100, 0) / grades.length)
         : 0;

      return (
         <div className="space-y-6 animate-fadeIn">
            <ChildHeader />

            {/* Stats Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                  { label: 'Total Subjects', value: grades.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                  { label: 'Overall Average', value: `${overallAvg}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { label: 'Best Score', value: grades.length ? `${Math.round(grades.reduce((best: number, g: any) => Math.max(best, (Number(g.score) / Number(g.maxScore)) * 100), 0))}%` : 'N/A', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                  { label: 'Attendance', value: `${child.attendancePercentage}%`, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
               ].map((s, i) => (
                  <div key={i} className={`${card} p-5 flex items-center gap-4`}>
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg}`}>
                        <s.icon size={22} className={s.color} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{s.value}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* Grade Tables by Term */}
            {Object.keys(termGroups).length === 0 ? (
               <div className={`${card} p-16 text-center`}>
                  <TrendingUp size={48} className="mx-auto mb-4 text-slate-300" />
                  <h4 className="text-xl font-black text-slate-400">No Grade Records</h4>
                  <p className="text-sm text-slate-300 mt-2">Grades will appear once teachers upload results.</p>
               </div>
            ) : (
               Object.entries(termGroups).map(([term, termGrades]) => (
                  <div key={term} className={`${card} overflow-hidden`}>
                     <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                           <GraduationCap size={18} className="text-indigo-600" /> {term}
                        </h3>
                        <span className="text-xs font-bold text-slate-400">{termGrades.length} subjects</span>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full">
                           <thead className="bg-slate-50 dark:bg-slate-800/50">
                              <tr>
                                 {['Subject', 'Score', 'Max Score', 'Percentage', 'Grade', 'Date'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">{h}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {termGrades.map((g: any, i: number) => {
                                 const pct = Math.round((Number(g.score) / Number(g.maxScore)) * 100);
                                 const grade = g.grade || getGradeLetter(Number(g.score), Number(g.maxScore));
                                 return (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                       <td className="px-5 py-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {g.subject.substring(0, 2).toUpperCase()}
                                             </div>
                                             <span className="font-bold text-sm text-slate-800 dark:text-white">{g.subject}</span>
                                          </div>
                                       </td>
                                       <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300">{Number(g.score)}</td>
                                       <td className="px-5 py-4 text-slate-500">{Number(g.maxScore)}</td>
                                       <td className="px-5 py-4">
                                          <div className="flex items-center gap-3">
                                             <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-20">
                                                <div className={`h-full rounded-full ${pct >= 60 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                             </div>
                                             <span className="font-black text-slate-800 dark:text-white text-sm">{pct}%</span>
                                          </div>
                                       </td>
                                       <td className="px-5 py-4">
                                          <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getGradeColor(grade)} flex items-center justify-center text-white font-black text-sm shadow-md`}>
                                             {grade}
                                          </span>
                                       </td>
                                       <td className="px-5 py-4 text-xs text-slate-400 font-bold">
                                          {new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                       </td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  </div>
               ))
            )}
         </div>
      );
   };

   // ─── VIEW: COMPLAINTS ────────────────────────────────────────────────────
   const renderComplaints = () => {
      const complaints = child.complaints || [];
      return (
         <div className="space-y-6 animate-fadeIn">
            <ChildHeader />

            <div className="grid grid-cols-3 gap-4">
               {[
                  { label: 'Total', value: complaints.length, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800' },
                  { label: 'Open', value: complaints.filter((c: any) => c.status === 'OPEN').length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                  { label: 'Resolved', value: complaints.filter((c: any) => c.status === 'RESOLVED').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
               ].map((s, i) => (
                  <div key={i} className={`${card} p-5 text-center ${s.bg}`}>
                     <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{s.label}</p>
                  </div>
               ))}
            </div>

            <div className={`${card} overflow-hidden`}>
               <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <MessageSquareWarning size={20} className="text-red-500" />
                  <h3 className="font-black text-slate-800 dark:text-white">Disciplinary Log</h3>
               </div>
               <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {complaints.length === 0 ? (
                     <div className="text-center py-20">
                        <CheckCheck size={48} className="mx-auto mb-4 text-emerald-400 opacity-40" />
                        <h4 className="text-xl font-black text-slate-400">Perfect Record</h4>
                        <p className="text-xs font-bold text-slate-300 mt-2 uppercase tracking-widest">No disciplinary records found</p>
                     </div>
                  ) : (
                     complaints.map((c: any, i: number) => {
                        const sev = getSeverityColor(c.severity);
                        return (
                           <div key={i} className={`p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative`}>
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${sev.dot} rounded-r`} />
                              <div className="pl-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                 <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${sev.bg} ${sev.text} ${sev.border}`}>
                                          {c.severity} Risk
                                       </span>
                                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${c.status === 'RESOLVED' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                                          {c.status}
                                       </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{c.description}</p>
                                 </div>
                                 <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-bold text-slate-400">
                                       {new Date(c.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="text-[9px] text-slate-300 uppercase tracking-widest mt-1">Academic Faculty</p>
                                 </div>
                              </div>
                           </div>
                        );
                     })
                  )}
               </div>
            </div>
         </div>
      );
   };

   // ─── VIEW: ATTENDANCE ────────────────────────────────────────────────────
   const renderAttendance = () => {
      const studentCardStyle = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';
      const totalDays = monthRecords.length;
      const attendancePct2 = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 0;

      return (
         <div className="space-y-6 animate-fadeIn">
            <ChildHeader />

            {/* Header with child name — matches student portal header */}
            <div className={`${studentCardStyle} p-6 flex items-center justify-between`}>
               <div>
                  <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">{child.firstName}'s Attendance</h1>
                  <p className="text-sm text-slate-400 font-bold mt-1">Academic Year 2025-26 · Grade {child.class}-{child.section}</p>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  {child.firstName[0]}
               </div>
            </div>

            {/* Statistics Cards — exact student portal style */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {[
                  { label: 'Total Days', value: totalDays, bgColor: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-700 dark:text-slate-300', borderColor: 'border-slate-300 dark:border-slate-600', icon: '📅' },
                  { label: 'Present', value: presentCount, bgColor: 'bg-emerald-100 dark:bg-emerald-900/20', textColor: 'text-emerald-700 dark:text-emerald-300', borderColor: 'border-emerald-300 dark:border-emerald-600', icon: '🟢' },
                  { label: 'Absent', value: absentCount, bgColor: 'bg-red-100 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-300', borderColor: 'border-red-300 dark:border-red-600', icon: '🔴' },
                  { label: 'Late', value: lateCount, bgColor: 'bg-amber-100 dark:bg-amber-900/20', textColor: 'text-amber-700 dark:text-amber-300', borderColor: 'border-amber-300 dark:border-amber-600', icon: '🟡' },
                  { label: 'Attendance %', value: `${attendancePct2}%`, bgColor: 'bg-indigo-100 dark:bg-indigo-900/20', textColor: 'text-indigo-700 dark:text-indigo-300', borderColor: 'border-indigo-300 dark:border-indigo-600', icon: '📊' },
               ].map((stat, idx) => (
                  <div key={idx} className={`rounded-[2rem] border ${stat.borderColor} shadow-sm transition-colors p-5 hover:shadow-md ${stat.bgColor}`}>
                     <div className="flex items-center gap-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <div className="flex-1">
                           <p className={`text-xs font-black uppercase ${stat.textColor} tracking-wider`}>{stat.label}</p>
                           <p className={`text-2xl font-black ${stat.textColor} mt-1`}>{stat.value}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Calendar — exact student portal style */}
            <div className={`${studentCardStyle} p-6`}>
               {/* Month Selector */}
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                     {attendanceMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                     <button onClick={() => setAttendanceMonth(new Date(calYear, calMonth - 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                     </button>
                     <button onClick={() => setAttendanceMonth(new Date(calYear, calMonth + 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                     </button>
                  </div>
               </div>

               {/* Calendar Grid */}
               <div className="mb-6">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                     {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div key={day} className="text-center font-black text-xs text-slate-400 py-2">{day}</div>
                     ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                     {/* leading empty cells for weekday offset (Mon=0) */}
                     {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                     {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                        const rec = attendanceMap.get(dayStr);
                        const statusStyle = rec ? getStatusColor(rec.status.toUpperCase()) : '';
                        return (
                           <div
                              key={i}
                              title={rec ? `${rec.status}${rec.markedBy ? ` by ${rec.markedBy.firstName} ${rec.markedBy.lastName}` : ''}` : undefined}
                              className={`p-3 rounded-lg text-center font-black text-sm ${rec ? statusStyle : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'} border border-transparent`}
                           >
                              <div>{i + 1}</div>
                              {rec && <div className="text-base">{getStatusIcon(rec.status.toUpperCase())}</div>}
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* Legend */}
               <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  {[['🟢', 'Present'], ['🔴', 'Absent'], ['🟡', 'Late'], ['⚪', 'Leave']].map(([icon, label]) => (
                     <div key={label} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                        <span className="text-lg">{icon}</span> {label}
                     </div>
                  ))}
               </div>
            </div>

            {/* Attendance History Table — exact student portal style */}
            <div className={`${studentCardStyle} overflow-hidden`}>
               <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Attendance History</h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                           <th className="px-6 py-3.5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                           <th className="px-6 py-3.5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                           <th className="px-6 py-3.5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Marked By</th>
                           <th className="px-6 py-3.5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Remarks</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(child.attendance || []).slice().reverse().slice(0, 20).map((r: any, i: number) => (
                           <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">
                                 {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <span className={`px-3 py-1 rounded-lg text-xs font-black inline-block ${getStatusColor(r.status?.toUpperCase())}`}>
                                    {getStatusIcon(r.status?.toUpperCase())} {r.status?.toUpperCase()}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                 {r.markedBy ? (
                                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50 px-3 py-1 rounded-lg text-xs font-black">
                                       👨‍🏫 {r.markedBy.firstName} {r.markedBy.lastName}
                                    </span>
                                 ) : (
                                    <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">
                                       — Not recorded
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                 {r.remarks || <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </td>
                           </tr>
                        ))}
                        {(child.attendance || []).length === 0 && (
                           <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                 <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
                                 <p className="text-xs font-bold uppercase tracking-widest">No attendance records found</p>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Low attendance warning */}
            {attendancePct2 < 75 && totalDays > 0 && (
               <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex gap-4">
                  <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={24} />
                  <div>
                     <h4 className="font-black text-red-700 dark:text-red-300">Low Attendance Warning</h4>
                     <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {child.firstName}'s attendance is below 75%. Please follow up with the school.
                     </p>
                  </div>
               </div>
            )}
         </div>
      );
   };

   // ─── ROUTER ──────────────────────────────────────────────────────────────
   const views: Record<string, () => React.ReactElement> = {
      overview: renderOverview,
      reports: renderReports,
      complaints: renderComplaints,
      attendance: renderAttendance,
      fees: () => (
         <div className="space-y-6 animate-fadeIn">
            <ChildHeader />
            <FeeDashboard studentId={child.id} />
         </div>
      ),
   };

   const render = views[activeView] || renderOverview;
   return render();
};

export default ParentPortal;
