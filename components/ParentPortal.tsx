import React, { useState, useEffect } from 'react';
import {
   Users,
   CheckCircle2,
   AlertTriangle,
   MessageCircle,
   TrendingUp,
   ShieldAlert,
   Bell,
   Phone,
   Target,
   Award,
   Stethoscope,
   ChevronRight,
   GraduationCap
} from 'lucide-react';
import { parentAPI } from '../services/api';

interface ParentPortalProps {
   isDarkMode: boolean;
   activeView: string;
}

const ParentPortal: React.FC<ParentPortalProps> = ({ isDarkMode, activeView }) => {
   const [parentData, setParentData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [selectedChildIndex, setSelectedChildIndex] = useState(0);

   useEffect(() => {
      const fetchParentData = async () => {
         try {
            const response = await parentAPI.getMe();
            if (response.success) {
               setParentData(response.data);
            }
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
         <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-lg text-indigo-600/60 uppercase tracking-widest">Enabling Guardian Shield...</p>
         </div>
      );
   }

   const children = parentData?.children || [];

   if (children.length === 0) {
      return (
         <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] border border-slate-200 dark:border-slate-800 text-center shadow-xl animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
               <Users size={48} className="text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">No Children Linked</h3>
            <p className="text-slate-500 mt-4 max-w-md mx-auto text-lg">We couldn't find any student records associated with the guardian email: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{parentData?.user?.email}</span></p>
            <button className="mt-8 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all active:scale-95">Support Helpdesk</button>
         </div>
      );
   }

   const child = children[selectedChildIndex];
   const complaints = child.complaints || [];

   const card = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300";

   const renderOverview = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         {/* ═══════ HEADER / STUDENT PICKER ═══════ */}
         <div className={`${card} p-5 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6`}>
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                  <ShieldAlert size={28} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Guardian Portal</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified Access: {parentData?.user?.email}</p>
               </div>
            </div>
            {children.length > 1 && (
               <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl gap-1">
                  {children.map((c: any, i: number) => (
                     <button
                        key={c.id}
                        onClick={() => setSelectedChildIndex(i)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${i === selectedChildIndex ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                     >
                        {c.firstName}
                     </button>
                  ))}
               </div>
            )}
         </div>

         {/* ═══════ HERO BANNER ═══════ */}
         <div className="bg-slate-900 dark:bg-black p-10 rounded-[3.5rem] text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-indigo-600/20" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -ml-48 -mb-48 transition-all duration-1000 group-hover:bg-purple-600/20" />

            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative z-10 w-full lg:w-auto">
               <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2.8rem] bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-5xl shadow-2xl border-4 border-white/10 ring-8 ring-white/5 flex-shrink-0">
                     {child.firstName[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-slate-900 flex items-center justify-center text-white">
                     <CheckCircle2 size={18} />
                  </div>
               </div>
               <div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">{child.firstName}'s Progress</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
                     <div className="bg-white/5 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                        <GraduationCap size={14} className="text-indigo-400" /> Grade {child.class}-{child.section}
                     </div>
                     <div className="bg-white/5 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                        <Target size={14} className="text-purple-400" /> Roll No: {child.rollNo}
                     </div>
                     <div className="bg-emerald-500/20 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 size={14} /> {child.status}
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 relative z-10 w-full lg:w-auto">
               <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[150px] flex-1 lg:flex-none hover:scale-105 transition-transform duration-500 group/item">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Attendance</p>
                  <p className="text-5xl font-black group-hover:text-indigo-400 transition-colors">{child.attendancePercentage}%</p>
                  <div className="w-full h-2 bg-white/10 rounded-full mt-5 overflow-hidden ring-1 ring-white/5">
                     <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${child.attendancePercentage}%` }} />
                  </div>
               </div>
               <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[150px] flex-1 lg:flex-none hover:scale-105 transition-transform duration-500 group/item">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-2">Blood Group</p>
                  <p className="text-5xl font-black group-hover:text-purple-400 transition-colors">{child.medicalInfo?.bloodGroup || 'N/A'}</p>
                  <div className="flex items-center justify-center gap-2 mt-5 text-[9px] font-black text-white/30 uppercase tracking-widest">
                     <Stethoscope size={12} /> Medical Safe
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Discipline / Complaints */}
            <div className={`${card} p-8 rounded-[3rem] group`}>
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/40 rounded-2xl text-red-600 shadow-sm group-hover:scale-110 transition-transform"><AlertTriangle size={24} /></div>
                        Disciplinary Logs
                     </h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Faculty Observations</p>
                  </div>
                  <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.2em] px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">{complaints.length} INCIDENTS</span>
               </div>

               <div className="space-y-5 max-h-[420px] overflow-y-auto pr-3 custom-scroll">
                  {complaints.map((c: any, i: number) => (
                     <div key={i} className="p-7 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${c.severity === 'HIGH' ? 'bg-red-500' : c.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-indigo-500'}`} />

                        <div className="flex justify-between items-start mb-4">
                           <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm ${c.severity === 'HIGH' ? 'bg-red-500 text-white' :
                                 c.severity === 'MEDIUM' ? 'bg-amber-500 text-white' :
                                    'bg-indigo-600 text-white'
                              }`}>
                              {c.severity} RISK
                           </span>
                           <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle2 size={12} className="text-emerald-500" /> {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                           </span>
                        </div>
                        <p className="text-base text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{c.description}</p>
                        <div className="mt-6 flex items-center justify-between bg-white/50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Users size={12} /> Filed By:
                           </p>
                           <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Academic Faculty</p>
                        </div>
                     </div>
                  ))}
                  {complaints.length === 0 && (
                     <div className="text-center py-20 text-slate-400">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-6 opacity-40">
                           <CheckCircle2 size={40} className="text-emerald-500" />
                        </div>
                        <h4 className="text-xl font-black text-slate-300 dark:text-slate-600">Perfect Record</h4>
                        <p className="text-xs font-bold mt-2 uppercase tracking-widest">No disciplinary markers found.</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Academic Highlights */}
            <div className={`${card} p-8 rounded-[3rem] group`}>
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 shadow-sm group-hover:scale-110 transition-transform"><TrendingUp size={24} /></div>
                        Academic Performance
                     </h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Current Term Scores</p>
                  </div>
                  <button className="flex items-center gap-2 group/btn">
                     <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] group-hover/btn:underline">Full Analytics</span>
                     <ChevronRight size={14} className="text-indigo-600 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
               </div>

               <div className="space-y-4">
                  {child.academicGrades?.slice(0, 5).map((g: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] hover:border-indigo-500/30 transition-all duration-300 group/item">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md font-black text-indigo-600 text-sm border border-indigo-500/10 group-hover/item:scale-110 transition-transform duration-500">
                              {g.subject.substring(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-base font-black text-slate-800 dark:text-white group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">{g.subject}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{g.term}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{g.score}%</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center justify-end gap-1">
                                 <TrendingUp size={8} className="text-emerald-500" /> Score
                              </p>
                           </div>
                           <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-600/20 border-2 border-white/10">
                              {g.grade}
                           </div>
                        </div>
                     </div>
                  ))}
                  {(!child.academicGrades || child.academicGrades.length === 0) && (
                     <div className="text-center py-20 text-slate-400">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-6 opacity-40">
                           <TrendingUp size={40} className="text-indigo-500" />
                        </div>
                        <h4 className="text-xl font-black text-slate-300 dark:text-slate-600">Pending Evaluation</h4>
                        <p className="text-xs font-bold mt-2 uppercase tracking-widest">No grades recorded this term.</p>
                     </div>
                  )}
               </div>

               {/* Achievements Section */}
               <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                     <h4 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                        <Award size={18} className="text-amber-500" /> Elite Achievements
                     </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     {child.achievements?.slice(0, 4).map((a: any, i: number) => (
                        <div key={i} className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[1.8rem] flex items-center gap-4 group/ach transition-all duration-500 hover:shadow-lg hover:shadow-amber-500/5">
                           <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md text-amber-500 group-hover/ach:rotate-12 transition-transform">
                              <Award size={20} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-amber-800 dark:text-amber-400 line-clamp-1 leading-tight">{a.title}</p>
                              <p className="text-[8px] font-bold text-amber-600 opacity-60 uppercase tracking-widest mt-1">{a.category}</p>
                           </div>
                        </div>
                     ))}
                     {(!child.achievements || child.achievements.length === 0) && (
                        <div className="col-span-2 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center justify-center gap-2">
                              <AlertTriangle size={12} /> Excellence tracking in progress
                           </p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );

   return renderOverview();
};

export default ParentPortal;
