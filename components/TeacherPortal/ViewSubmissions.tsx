import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Download,
    X,
    Loader2,
    Award,
    CheckCircle,
} from 'lucide-react';
import { assignmentAPI, BASE_URL } from '../../services/api';

interface ViewSubmissionsProps {
    assignmentId: string;
    onBack: () => void;
}

export default function ViewSubmissions({ assignmentId, onBack }: ViewSubmissionsProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
    const [gradeForm, setGradeForm] = useState({
        marksObtained: '',
        feedback: '',
    });

    useEffect(() => {
        fetchSubmissions();
    }, [assignmentId]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const result = await assignmentAPI.getAssignmentSubmissions(assignmentId);
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmission = async (submissionId: string) => {
        try {
            if (!gradeForm.marksObtained) {
                alert('Please enter marks');
                return;
            }

            const result = await assignmentAPI.gradeSubmission(submissionId, {
                marksObtained: parseInt(gradeForm.marksObtained),
                feedback: gradeForm.feedback,
            });

            if (result.success) {
                setGradingSubmission(null);
                setGradeForm({ marksObtained: '', feedback: '' });
                fetchSubmissions();
            }
        } catch (error) {
            console.error('Error grading submission:', error);
            alert('Failed to grade submission');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'GRADED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'LATE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 size={48} className="animate-spin text-purple-600" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Loading submissions...</p>
            </div>
        );
    }

    if (!data) return null;

    const { assignment, submissions } = data;
    const submittedCount = submissions.filter((s: any) => s.status !== 'PENDING').length;
    const gradedCount = submissions.filter((s: any) => s.status === 'GRADED').length;

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full -mr-32 -mt-32"></div>

                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:gap-3 transition-all font-black text-xs uppercase tracking-widest mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to List
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                            {assignment.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-black tracking-widest uppercase">
                                {assignment.subject}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Class {assignment.class}{assignment.section ? `-${assignment.section}` : ''}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                            {assignment.maxMarks && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                        Max Marks: {assignment.maxMarks}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {assignment.attachmentUrl && (
                        <a
                            href={`${BASE_URL}${assignment.attachmentUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={assignment.attachmentName || 'assignment'}
                            className="px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Download size={18} />
                            Assignment Paper
                        </a>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Students', value: submissions.length, color: 'text-slate-800 dark:text-slate-100' },
                    { label: 'Submitted', value: submittedCount, color: 'text-blue-600' },
                    { label: 'Graded', value: gradedCount, color: 'text-emerald-600' },
                    { label: 'Pending', value: submissions.length - submittedCount, color: 'text-amber-600' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            {stat.label}
                        </div>
                        <div className={`text-3xl font-black ${stat.color}`}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                        Student Performance Grid
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Submitted At</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Marks</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {submissions.map((s: any) => (
                                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center font-black text-purple-600 text-sm border border-purple-100/50 dark:border-purple-800/30 shadow-sm group-hover:scale-110 transition-transform">
                                                {s.rollNo}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 dark:text-slate-100 text-sm mb-0.5">{s.studentName}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adm: {s.admissionNo}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase inline-block ${getStatusColor(s.status)}`}>
                                            {s.isLate && s.status === 'SUBMITTED' ? 'LATE' : s.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {s.submittedAt ? (
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{new Date(s.submittedAt).toLocaleDateString()}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                    {new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 dark:text-slate-700">--</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {s.marksObtained !== null ? (
                                            <div className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                                <Award size={14} className="text-emerald-600" />
                                                <span className="font-black text-emerald-600 text-sm">
                                                    {s.marksObtained}/{assignment.maxMarks || '-'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300">--</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-3">
                                            {s.attachmentUrl && (
                                                <a
                                                    href={`${BASE_URL}${s.attachmentUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download={s.attachmentName || 'submission'}
                                                    className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="View Submission"
                                                >
                                                    <Download size={16} />
                                                </a>
                                            )}
                                            {(s.status === 'SUBMITTED' || s.status === 'GRADED') && assignment.maxMarks && (
                                                <button
                                                    onClick={() => {
                                                        setGradingSubmission(s.id);
                                                        setGradeForm({
                                                            marksObtained: s.marksObtained?.toString() || '',
                                                            feedback: s.feedback || '',
                                                        });
                                                    }}
                                                    className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    title="Grade/Edit"
                                                >
                                                    <Award size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {gradingSubmission && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in duration-300"
                        onClick={() => setGradingSubmission(null)}
                    ></div>

                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl z-[101] p-10 animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                    <Award size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                    Grade Submission
                                </h3>
                            </div>
                            <button
                                onClick={() => setGradingSubmission(null)}
                                className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                    Marks Awarded (Max: {assignment.maxMarks})
                                </label>
                                <input
                                    type="number"
                                    value={gradeForm.marksObtained}
                                    onChange={(e) =>
                                        setGradeForm({ ...gradeForm, marksObtained: e.target.value })
                                    }
                                    max={assignment.maxMarks}
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-black text-xl text-emerald-600 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                    Private Feedback
                                </label>
                                <textarea
                                    value={gradeForm.feedback}
                                    onChange={(e) =>
                                        setGradeForm({ ...gradeForm, feedback: e.target.value })
                                    }
                                    placeholder="Tell the student how they can improve..."
                                    rows={4}
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all resize-none"
                                />
                            </div>

                            <button
                                onClick={() => handleGradeSubmission(gradingSubmission)}
                                className="w-full px-8 py-5 rounded-2xl bg-emerald-600 text-white font-black text-base shadow-xl shadow-emerald-500/25 hover:bg-emerald-700 transform active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                            >
                                <CheckCircle size={22} />
                                CONFIRM GRADE
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
