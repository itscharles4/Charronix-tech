
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Award, 
  HeartPulse, 
  MessageSquare, 
  TrendingUp, 
  User, 
  FileText,
  MapPin,
  Stethoscope,
  ChevronRight,
  ClipboardCheck,
  GraduationCap
} from 'lucide-react';
import { Student } from '../types';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACADEMICS' | 'HEALTH' | 'COMMUNICATION'>('OVERVIEW');

  const academicData = student.academicGrades?.map(g => ({
    subject: g.subject,
    score: g.score,
    fullMark: g.maxScore
  })) || [];

  const getStatusColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-500';
    if (attendance >= 75) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-widest hidden sm:inline">Back to List</span>
          </button>
          
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[2.2rem] bg-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-indigo-100 dark:shadow-none">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full uppercase tracking-widest">
                  ID: {student.admissionNo}
                </span>
                <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full uppercase tracking-widest">
                  Roll: {student.rollNo}
                </span>
                <span className="text-[10px] font-black px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full uppercase tracking-widest">
                  Grade {student.class}-{student.section}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
            <FileText size={18} /> Report Card
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scroll">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: TrendingUp },
          { id: 'ACADEMICS', label: 'Examination', icon: GraduationCap },
          { id: 'HEALTH', label: 'Medical', icon: HeartPulse },
          { id: 'COMMUNICATION', label: 'History', icon: MessageSquare }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Stats Column (Sticky on Desktop) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Vital Statistics</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance Rate</p>
                  <p className={`text-2xl font-black ${getStatusColor(student.overallAttendance || 0)}`}>
                    {student.overallAttendance || '--'}%
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl">
                  <ClipboardCheck className="text-indigo-500" size={24} />
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance Rank</p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    #{student.rollNo + 2} <span className="text-xs font-bold text-slate-400">/ 45</span>
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl">
                  <TrendingUp className="text-emerald-500" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Parent Details</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Guardian</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{student.parentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Block C, Sector 12, New Delhi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Main Column */}
        <div className="xl:col-span-2">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">Skill Matrix</h3>
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Term 1 Analysis
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={academicData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <Radar
                        name="Student"
                        dataKey="score"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Recent Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.achievements?.map((ach) => (
                    <div key={ach.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-amber-200 transition-all flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                        <Award size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{ach.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{ach.date}</p>
                      </div>
                    </div>
                  )) || <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl italic">No achievements recorded.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ACADEMICS' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex justify-between items-center">
                <h3 className="text-xl font-black">Examination Report Card</h3>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">2025-26 Session</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Max Marks</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Marks Obtained</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {student.academicGrades?.map((g, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-6 text-sm font-black text-slate-800 dark:text-white">{g.subject}</td>
                        <td className="px-8 py-6 text-sm text-slate-500 font-bold text-center">{g.maxScore}</td>
                        <td className="px-8 py-6 text-sm font-black text-indigo-600 dark:text-indigo-400 text-center">
                          <div className="flex flex-col items-center">
                            <span>{g.score}</span>
                            <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${(g.score/g.maxScore)*100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={`px-3 py-1 rounded-lg text-xs font-black shadow-sm ${
                            g.grade.includes('A') ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {g.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'HEALTH' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                <HeartPulse className="text-red-500" /> Medical History
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                    <Stethoscope size={32} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                  <p className="text-4xl font-black text-slate-800 dark:text-white">{student.medicalInfo?.bloodGroup || 'N/A'}</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Allergies & Sensitivities</p>
                    <div className="flex flex-wrap gap-2">
                      {student.medicalInfo?.allergies.map((a, i) => (
                        <span key={i} className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-black uppercase tracking-widest">
                          {a}
                        </span>
                      )) || <span className="text-sm font-bold text-slate-400 italic">None reported</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Chronic Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {student.medicalInfo?.chronicConditions.map((c, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest">
                          {c}
                        </span>
                      )) || <span className="text-sm font-bold text-slate-400 italic">No conditions</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COMMUNICATION' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 flex items-center gap-3">
                <MessageSquare className="text-indigo-500" /> Parent-Teacher Log
              </h3>
              <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                {student.communicationLogs?.map((log) => (
                  <div key={log.id} className="relative pl-12">
                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center z-10 shadow-sm border ${
                      log.type === 'Call' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white dark:bg-slate-800 text-indigo-600 border-slate-200 dark:border-slate-700'
                    }`}>
                      <MessageSquare size={18} />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{log.type} Interaction</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{log.date}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{log.note}</p>
                      <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-black">MI</div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged by {log.author}</p>
                      </div>
                    </div>
                  </div>
                )) || <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl italic">No interactions logged yet.</p>}
                
                <button className="ml-12 w-[calc(100%-3rem)] flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 dark:hover:text-indigo-400 dark:hover:border-indigo-400 rounded-3xl text-xs font-black uppercase tracking-widest transition-all">
                  New Communication Entry <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
