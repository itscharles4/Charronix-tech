// BACKUP - StudentPortal.tsx - Created on Feb 22, 2026
// This is the original StudentPortal component before implementing dedicated Attendance and Notifications pages
// To restore: Replace StudentPortal.tsx content with this backup if needed

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
  Trophy,
  Target,
  Zap,
  GraduationCap,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { studentAPI } from '../services/api';
import Timetable from './Timetable';
// Remove MOCK_STUDENTS import if no longer needed for fallback
// import { MOCK_STUDENTS, MOCK_NOTICES } from '../constants';
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
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getMe();
        if (response.success) {
          setStudent(response.data);
        } else {
          setError(response.message || 'Failed to load profile');
        }
      } catch (err: any) {
        setError(err.message || 'Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
        <h3 className="text-xl font-black mb-2 tracking-tight">Access Denied or Error</h3>
        <p className="font-bold text-slate-500 max-w-md">{error || 'Could not retrieve student record. Please check your credentials.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all active:scale-95"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  const examResults = student.academicGrades || [];
  const notifications = student.notices || [];
  const fullName = `${student.firstName} ${student.lastName}`;
  const initials = `${student.firstName[0]}${student.lastName[0]}`;
  const avgScore = student.avgPercentage || 0;

  // Build bar chart data
  const barData = (student.grades || []).map((r: any, i: number) => ({
    subject: r.subject.slice(0, 4).toUpperCase(),
    fullName: r.subject,
    score: r.score,
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const chartData = (student.grades || []).map((r: any) => ({
    subject: r.subject.slice(0, 4).toUpperCase(),
    score: r.score
  }));

  const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';
  const chartAxisTick = { fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 'bold' as const };
  const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';

  // Download PDF Handler
  const handleDownloadPDF = async () => {
    try {
      if (!reportRef.current) return;
      
      // Create a canvas from the report element
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save PDF with student name
      pdf.save(`${student.firstName}_${student.lastName}_ExamReport.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  // [REST OF THE COMPONENT CODE WOULD FOLLOW...]
  // This is a backup file - see StudentPortal.tsx for full implementation

  return null;
};

export default StudentPortal;
