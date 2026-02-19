
import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  MessageCircle, 
  TrendingUp,
  ShieldAlert,
  Bell,
  Phone
} from 'lucide-react';
import { MOCK_STUDENTS } from '../constants';

interface ParentPortalProps {
  isDarkMode: boolean;
  activeView: string;
}

const ParentPortal: React.FC<ParentPortalProps> = ({ isDarkMode, activeView }) => {
  const child = MOCK_STUDENTS[0]; // Logic for child linked to parent login
  const complaints = child.complaints || [
    { id: 'c1', description: 'Consistently late to 1st period Mathematics.', teacherName: 'Meera Iyer', date: '2026-01-18', severity: 'MEDIUM' }
  ];

  const renderOverview = () => (
    <div className="space-y-8 animate-in">
      <div className="bg-indigo-700 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
         <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-4xl border border-white/30">
               {child.firstName[0]}
            </div>
            <div>
               <h2 className="text-3xl font-black">{child.firstName}'s Progress</h2>
               <p className="text-white/70 font-bold mt-2 uppercase text-xs tracking-widest">Class {child.class}-{child.section} • Roll No: {child.rollNo}</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="bg-white/10 p-5 rounded-3xl border border-white/10 text-center">
               <p className="text-[10px] font-black uppercase tracking-widest mb-1">Attendance</p>
               <p className="text-2xl font-black">{child.overallAttendance}%</p>
            </div>
            <div className="bg-white/10 p-5 rounded-3xl border border-white/10 text-center">
               <p className="text-[10px] font-black uppercase tracking-widest mb-1">Health</p>
               <p className="text-2xl font-black">B+</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Discipline / Complaints */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="text-red-500" /> Disciplinary Notes
           </h3>
           <div className="space-y-4">
              {complaints.map((c: any, i: number) => (
                <div key={i} className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl">
                   <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded uppercase tracking-widest">{c.severity}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{c.date}</span>
                   </div>
                   <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{c.description}</p>
                   <p className="mt-3 text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">— {c.teacherName}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Academic Highlights */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <TrendingUp className="text-indigo-500" /> Subject Grades
           </h3>
           <div className="space-y-4">
              {child.academicGrades?.slice(0, 4).map((g, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                   <span className="text-sm font-black text-slate-700 dark:text-slate-200">{g.subject}</span>
                   <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{g.score}/100</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  return renderOverview();
};

export default ParentPortal;
