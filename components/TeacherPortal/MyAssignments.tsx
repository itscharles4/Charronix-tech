import React, { useState, useEffect } from 'react';
import { Eye, Download, Trash2, Users, CheckCircle, Clock, Loader2, FileText } from 'lucide-react';
import { assignmentAPI } from '../../services/api';
import ViewSubmissions from './ViewSubmissions.tsx';

export default function MyAssignments() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const result = await assignmentAPI.getTeacherAssignments();
            if (result.success) {
                setAssignments(result.data);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (assignmentId: string) => {
        if (!confirm('Are you sure you want to delete this assignment? All student submissions for it will also be deleted.')) return;

        try {
            const result = await assignmentAPI.deleteAssignment(assignmentId);
            if (result.success) {
                fetchAssignments();
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert('Failed to delete assignment');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'EXPIRED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'DRAFT': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 size={48} className="animate-spin text-purple-600" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Loading assignments...</p>
            </div>
        );
    }

    if (selectedAssignment) {
        return (
            <ViewSubmissions
                assignmentId={selectedAssignment}
                onBack={() => setSelectedAssignment(null)}
            />
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                        My Assignments
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Manage your assignments and track student progress
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 px-4 py-2 rounded-xl">
                    <span className="text-purple-600 dark:text-purple-400 font-black text-lg">{assignments.length}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase ml-2 tracking-wider">Total</span>
                </div>
            </div>

            {assignments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform">
                        <FileText size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">
                        NO ASSIGNMENTS FOUND
                    </h3>
                    <p className="text-slate-400 max-w-sm mx-auto font-medium">
                        You haven't created any assignments yet. Use the "Create Assignment" tool to start teaching.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assignments.map((assignment) => {
                        const isOverdue = new Date(assignment.dueDate) < new Date();
                        const submissionRate = assignment.totalStudents > 0
                            ? Math.round((assignment.submittedCount / assignment.totalStudents) * 100)
                            : 0;

                        return (
                            <div
                                key={assignment.id}
                                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusColor(assignment.status)}`}>
                                            {assignment.status}
                                        </span>
                                        <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                            Class {assignment.class}{assignment.section ? `-${assignment.section}` : ''}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">
                                        {assignment.title}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                        {assignment.subject}
                                    </p>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 font-medium leading-relaxed mb-6">
                                        {assignment.description}
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                            <span>Submissions</span>
                                            <span className="text-slate-800 dark:text-slate-100">{assignment.submittedCount}/{assignment.totalStudents}</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                                                style={{ width: `${submissionRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 pt-0 mt-auto">
                                    <div className={`p-4 rounded-2xl flex items-center gap-3 mb-6 transition-colors ${isOverdue ? 'bg-red-50 dark:bg-red-900/10 text-red-600' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500'
                                        }`}>
                                        <Clock size={18} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Due Date</span>
                                            <span className="text-xs font-black">{new Date(assignment.dueDate).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedAssignment(assignment.id)}
                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                                        >
                                            <Eye size={16} />
                                            Submissions
                                        </button>

                                        <button
                                            onClick={() => handleDelete(assignment.id)}
                                            className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:rotate-6 shadow-sm"
                                            title="Delete Assignment"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
