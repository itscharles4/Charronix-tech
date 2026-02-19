
import React from 'react';
import { Users, UserCheck, UserX, AlertTriangle, Bell, Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
  isDarkMode: boolean;
}

const stats = [
  { label: 'Total Students', value: '452', icon: Users, color: 'bg-blue-500', darkColor: 'dark:bg-blue-600' },
  { label: 'Present Today', value: '418', icon: UserCheck, color: 'bg-green-500', darkColor: 'dark:bg-green-600' },
  { label: 'Absent Today', value: '34', icon: UserX, color: 'bg-red-500', darkColor: 'dark:bg-red-600' },
  { label: 'Attendance %', value: '92.5%', icon: AlertTriangle, color: 'bg-amber-500', darkColor: 'dark:bg-amber-600' },
];

const attendanceData = [
  { name: 'Mon', present: 410, absent: 42 },
  { name: 'Tue', present: 425, absent: 27 },
  { name: 'Wed', present: 395, absent: 57 },
  { name: 'Thu', present: 418, absent: 34 },
  { name: 'Fri', present: 420, absent: 32 },
];

const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
  const chartText = isDarkMode ? '#94a3b8' : '#64748b';
  const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6 hover:shadow-md transition-all">
            <div className={`${stat.color} ${stat.darkColor} p-4 rounded-2xl text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Weekly Attendance</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
                <Clock size={20} />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
                <Bell size={20} />
              </button>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartText, fontSize: 12, fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartText, fontSize: 12, fontWeight: 'bold' }}
                />
                <Tooltip
                  cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderRadius: '16px',
                    border: `1px solid ${tooltipBorder}`,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="present" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={20} />
                <Bar dataKey="absent" fill="#ef4444" radius={[6, 6, 6, 6]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications / Activity */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <Bell className="animate-bounce-slow" /> Recent Activity
            </h3>

            <div className="space-y-6">
              {[
                { title: 'New Admission', time: '2 hours ago', desc: 'Rahul Kumar added to Class 9-A' },
                { title: 'Fee Payment', time: '4 hours ago', desc: 'Verified payment for ADM2023001' },
                { title: 'Staff Meeting', time: 'Yesterday', desc: 'Monthly review scheduled for Friday' },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm tracking-wide">{item.title}</span>
                    <span className="text-[10px] opacity-70 bg-black/20 px-2 py-1 rounded-full">{item.time}</span>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 bg-white py-4 rounded-xl text-indigo-600 font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
