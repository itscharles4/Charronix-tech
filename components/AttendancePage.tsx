/**
 * @database_relationships
 * -------------------------------------------------------------------------------------------------
 * This document outlines the primary ER relationships for the Charronix School Management System.
 * Source: backend/prisma/schema.prisma
 * 
 * 🔐 AUTH & USER DOMAIN
 * - User ||--o| Student : "is" (1:1 via userId)
 * - User ||--o| Teacher : "is" (1:1 via userId)
 * - User ||--o{ Session / RefreshToken / PasswordResetToken : "has"
 * - User ||--o{ Notification / AiChatHistory / AuditLog : "owns"
 * 
 * 🎓 ACADEMIC DOMAIN
 * - Student ||--o{ Attendance : "has" (M:1 via studentId)
 * - Student ||--o{ AcademicGrade : "has" (M:1 via studentId)
 * - Student ||--o{ Achievement / CommunicationLog / Complaint : "has"
 * - Student ||--o| MedicalInfo : "has"
 * 
 * 👨‍🏫 TEACHER DOMAIN
 * - Teacher ||--o{ Attendance : "marks" (M:1 via markedById)
 * - Teacher ||--o{ AcademicGrade : "enters" (M:1 via enteredById)
 * - Teacher ||--o{ TeacherSubject / TeacherClass : "assigned to"
 * 
 * 📅 TIMETABLE DOMAIN
 * - TimetableClass ||--o{ TimetableSection : "has"
 * - TimetableSection ||--o{ TimetableEntry : "used in"
 * - GeneratedTimetable ||--o{ TimetableEntry : "contains"
 * - TimetableEntry ||--o| (Class, Section, Subject, Teacher) : "references"
 * 
 * 🏫 SCHOOL CONFIG
 * - SchoolTiming ||--o{ SchoolBreak / SchoolWorkingDay : "has"
 * -------------------------------------------------------------------------------------------------
 */
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertCircle,
  TrendingUp,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { studentAPI } from '../services/api';

interface AttendancePageProps {
  isDarkMode: boolean;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  markedBy?: string;
  remarks?: string;
}

interface MonthlyStats {
  year: number;
  month: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ isDarkMode }) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);

  const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth() + 1;

        // Fetch attendance data from API
        const response = await studentAPI.getAttendance(year, month);
        console.log('Attendance API Response:', response); // Debug log

        if (response?.data) {
          setStudent(response.data.student);
          // Convert dates to proper format for display
          const records = response.data.attendance.map((r: any) => ({
            date: typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0],
            status: (r.status || '').toLowerCase(),
            markedBy: r.markedBy,
            remarks: r.remarks
          }));
          setAttendanceRecords(records);
          setMonthlyStats({
            year: response.data.year,
            month: response.data.month,
            present: response.data.statistics?.present || 0,
            absent: response.data.statistics?.absent || 0,
            late: response.data.statistics?.late || 0,
            leave: response.data.statistics?.leave || 0,
          });
        } else {
          setError('No attendance data found');
        }
      } catch (err: any) {
        console.error('Error fetching attendance:', err);
        setError(err.message || 'Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const handleDownloadPDF = async () => {
    try {
      const reportElement = document.getElementById('attendance-report');
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${student?.firstName}_${student?.lastName}_Attendance.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'present': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50';
      case 'absent': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700/50';
      case 'late': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/50';
      case 'leave': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/50';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'present': return '🟢';
      case 'absent': return '🔴';
      case 'late': return '🟡';
      case 'leave': return '⚪';
      default: return '⬜';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
        <p className="font-bold text-lg">Loading Attendance Data...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 p-8 text-center">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-xl font-black mb-2">Error Loading Attendance</h3>
        <p className="font-bold text-slate-500">{error}</p>
      </div>
    );
  }

  const totalDays = attendanceRecords.length;
  const attendancePercentage = monthlyStats ? Math.round(
    ((monthlyStats.present + monthlyStats.late) / totalDays) * 100
  ) : 0;

  const fullName = `${student.firstName} ${student.lastName}`;
  const initials = `${student.firstName[0]}${student.lastName[0]}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Download */}
      <div className={`${card} p-6 flex items-center justify-between`}>
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">My Attendance</h1>
          <p className="text-sm text-slate-400 font-bold mt-1">Academic Year 2025-26</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Days', value: totalDays, bgColor: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-700 dark:text-slate-300', borderColor: 'border-slate-300 dark:border-slate-600', icon: '📅' },
          { label: 'Present', value: monthlyStats?.present || 0, bgColor: 'bg-emerald-100 dark:bg-emerald-900/20', textColor: 'text-emerald-700 dark:text-emerald-300', borderColor: 'border-emerald-300 dark:border-emerald-600', icon: '🟢' },
          { label: 'Absent', value: monthlyStats?.absent || 0, bgColor: 'bg-red-100 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-300', borderColor: 'border-red-300 dark:border-red-600', icon: '🔴' },
          { label: 'Late', value: monthlyStats?.late || 0, bgColor: 'bg-amber-100 dark:bg-amber-900/20', textColor: 'text-amber-700 dark:text-amber-300', borderColor: 'border-amber-300 dark:border-amber-600', icon: '🟡' },
          { label: 'Attendance %', value: `${attendancePercentage}%`, bgColor: 'bg-indigo-100 dark:bg-indigo-900/20', textColor: 'text-indigo-700 dark:text-indigo-300', borderColor: 'border-indigo-300 dark:border-indigo-600', icon: '📊' },
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

      {/* Attendance Report */}
      <div id="attendance-report" className={`${card} p-6`}>
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
            {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-black text-xs text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: getDaysInMonth(selectedMonth) }).map((_, i) => {
              const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1);
              const record = attendanceRecords.find(r => r.date === date.toISOString().split('T')[0]);
              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-center font-black text-sm ${record
                    ? getStatusColor(record.status)
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    } border`}
                >
                  <div>{i + 1}</div>
                  {record && <div className="text-base">{getStatusIcon(record.status)}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          {[
            { icon: '🟢', label: 'Present' },
            { icon: '🔴', label: 'Absent' },
            { icon: '🟡', label: 'Late' },
            { icon: '⚪', label: 'Leave' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
              <span className="text-lg">{item.icon}</span> {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className={`${card} overflow-hidden`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Recent Attendance</h3>
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
              {attendanceRecords.slice().reverse().map((record, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black inline-block ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {getStatusIcon(record.status)} {record.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                    {record.markedBy}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {record.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      {attendancePercentage < 75 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex gap-4">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h4 className="font-black text-red-700 dark:text-red-300">Low Attendance Warning</h4>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Your attendance is below 75%. Please ensure regular attendance to avoid academic issues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
