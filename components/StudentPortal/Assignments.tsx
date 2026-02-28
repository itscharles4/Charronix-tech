import React, { useState, useEffect } from 'react';
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    Upload,
    Loader2,
    Award,
    ChevronRight,
    Filter
} from 'lucide-react';
import { assignmentAPI, BASE_URL } from '../../services/api';
import SubmissionModal from './SubmissionModal.tsx';

export default function Assignments() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED'>('ALL');
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const result = await assignmentAPI.getStudentAssignments();
            if (result.success) {
                setSubmissions(result.data);
            }
        } catch (error) {
            console.error('Error fetching student assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = submissions.filter(s => {
        if (filter === 'ALL') return true;
        return s.status === filter;
    });

    const getStatusDisplay = (submission: any) => {
        const isOverdue = !submission.submittedAt && new Date(submission.assignment.dueDate) < new Date();

        if (submission.status === 'GRADED') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Graded
                </span>
            );
        }

        if (submission.status === 'SUBMITTED') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Submitted
                </span>
            );
        }

        if (isOverdue) {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={12} /> Overdue
                </span>
            );
        }

        return (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
                <Clock size={12} /> Pending
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading assignments...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Assignment Lab</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Submit your work and track grades</p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                    {(['ALL', 'PENDING', 'SUBMITTED', 'GRADED'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filteredAssignments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                        <Filter size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2 uppercase">No {filter !== 'ALL' ? filter.toLowerCase() : ''} assignments</h3>
                    <p className="text-slate-400 text-sm font-medium">Great job! You're all caught up with your homework for now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAssignments.map((sub) => {
                        const asm = sub.assignment;
                        const isOverdue = !sub.submittedAt && new Date(asm.dueDate) < new Date();
                        const canSubmit = sub.status === 'PENDING' && (asm.allowLateSubmission || !isOverdue);

                        return (
                            <div
                                key={sub.id}
                                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col border-b-4 border-b-slate-100 dark:border-b-slate-800"
                            >
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-800/30">
                                            {asm.subject}
                                        </span>
                                        {getStatusDisplay(sub)}
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-indigo-600 transition-colors">
                                            {asm.title}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            Teacher: {asm.teacher?.firstName} {asm.teacher?.lastName}
                                        </p>
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">
                                        {asm.description}
                                    </p>

                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                Due: {new Date(asm.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {asm.maxMarks && (
                                            <div className="flex items-center gap-2 text-indigo-500">
                                                <Award size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{asm.maxMarks} Marks</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {sub.status === 'GRADED' && (
                                    <div className="px-6 py-4 bg-emerald-50/50 dark:bg-emerald-900/5 border-t border-emerald-100 dark:border-emerald-800/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Grade Result</span>
                                                <span className="text-base font-black text-slate-800 dark:text-slate-100">{sub.marksObtained} / {asm.maxMarks}</span>
                                            </div>
                                            {sub.feedback && (
                                                <div className="flex-1 ml-6 p-2 rounded-xl bg-white dark:bg-slate-800 text-[10px] italic text-slate-500 line-clamp-2 border border-emerald-100 dark:border-emerald-800">
                                                    "{sub.feedback}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                    {asm.attachmentUrl && (
                                        <a
                                            href={`${BASE_URL}${asm.attachmentUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={asm.attachmentName || 'assignment'}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                                        >
                                            <Download size={14} /> Download Paper
                                        </a>
                                    )}

                                    {canSubmit ? (
                                        <button
                                            onClick={() => setSelectedSubmission(sub)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
                                        >
                                            <Upload size={14} /> Submit Work
                                        </button>
                                    ) : sub.status === 'PENDING' && isOverdue && !asm.allowLateSubmission ? (
                                        <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 font-black text-[10px] uppercase tracking-widest opacity-60">
                                            <AlertCircle size={14} /> Submission Closed
                                        </div>
                                    ) : null}

                                    {sub.status !== 'PENDING' && sub.attachmentUrl && (
                                        <a
                                            href={`${BASE_URL}${sub.attachmentUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={sub.attachmentName || 'submission'}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-600 transition-all shadow-sm"
                                        >
                                            <FileText size={14} /> View My Work
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedSubmission && (
                <SubmissionModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    onSuccess={() => {
                        setSelectedSubmission(null);
                        fetchAssignments();
                    }}
                />
            )}
        </div>
    );
}
