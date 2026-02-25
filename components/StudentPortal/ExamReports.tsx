import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    TrendingUp,
    Award,
    BookOpen,
    Loader2,
    AlertCircle,
    Download,
    ChevronDown,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { studentAPI } from '../../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

interface ExamReportsProps {
    isDarkMode: boolean;
}

const ExamReports: React.FC<ExamReportsProps> = ({ isDarkMode }) => {
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTerm, setSelectedTerm] = useState<string>('All');
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

    const handleDownloadPDF = async () => {
        try {
            if (!reportRef.current || !student) return;
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
            });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${student.firstName}_${student.lastName}_ExamReport.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Failed to download PDF. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
                <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
                <p className="font-bold text-lg">Loading Exam Reports...</p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 p-8 text-center">
                <AlertCircle size={48} className="mb-4" />
                <h3 className="text-xl font-black mb-2 tracking-tight">Error Loading Reports</h3>
                <p className="font-bold text-slate-500 max-w-md">{error || 'Could not retrieve exam data.'}</p>
            </div>
        );
    }

    const grades = student.academicGrades || student.grades || [];
    const terms = Array.from(new Set(grades.map((g: any) => g.term))) as string[];
    const filteredGrades = selectedTerm === 'All' ? grades : grades.filter((g: any) => g.term === selectedTerm);

    const barData = filteredGrades.map((g: any, i: number) => ({
        subject: g.subject.slice(0, 4).toUpperCase(),
        fullName: g.subject,
        score: Number(g.score) || 0,
        maxScore: Number(g.maxScore) || 100,
        grade: g.grade || '',
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
    }));

    const avgScore = barData.length > 0
        ? Math.round(barData.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * 100, 0) / barData.length)
        : 0;

    const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';
    const chartAxisTick = { fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 'bold' as const };
    const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';

    return (
        <div className="space-y-6 animate-fadeIn" ref={reportRef}>
            {/* Header */}
            <div className={`${card} p-6`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-300 dark:shadow-none">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Exam Reports</h3>
                            <p className="text-xs text-slate-400 font-bold">{student.firstName} {student.lastName} • Class {student.class}-{student.section}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Term Filter */}
                        <div className="relative">
                            <select
                                value={selectedTerm}
                                onChange={e => setSelectedTerm(e.target.value)}
                                className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 font-black text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                                <option value="All">All Terms</option>
                                {terms.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Download PDF */}
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-300 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            <Download size={16} /> PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
                    <Award size={16} /> Average: {avgScore}%
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-purple-200 dark:border-purple-800">
                    <BookOpen size={16} /> Subjects: {filteredGrades.length}
                </div>
            </div>

            {/* Chart */}
            {barData.length > 0 && (
                <div className={`${card} p-6`}>
                    <h4 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-indigo-500" /> Performance Overview
                    </h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                                <XAxis dataKey="subject" tick={chartAxisTick} axisLine={false} tickLine={false} />
                                <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                    }}
                                />
                                <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={40}>
                                    {barData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Grades Table */}
            {filteredGrades.length > 0 ? (
                <div className={`${card} overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Max</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Term</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredGrades.map((g: any, i: number) => {
                                    const pct = Math.round((Number(g.score) / Number(g.maxScore || 100)) * 100);
                                    const gradeColor = pct >= 80 ? 'text-emerald-600 dark:text-emerald-400'
                                        : pct >= 60 ? 'text-blue-600 dark:text-blue-400'
                                            : pct >= 40 ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-red-600 dark:text-red-400';

                                    return (
                                        <tr key={g.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-100">{g.subject}</td>
                                            <td className="px-6 py-4 text-center font-black text-slate-700 dark:text-slate-200">{Number(g.score)}</td>
                                            <td className="px-6 py-4 text-center text-sm font-bold text-slate-400">{Number(g.maxScore || 100)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-500">{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-xl font-black ${gradeColor}`}>{g.grade || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">{g.term}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className={`${card} p-12 text-center`}>
                    <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No exam results found for the selected term</p>
                </div>
            )}
        </div>
    );
};

export default ExamReports;
