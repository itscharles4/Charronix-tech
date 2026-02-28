import React, { useState } from 'react';
import {
    X,
    Upload,
    FileText,
    CheckCircle,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { assignmentAPI } from '../../services/api';

interface SubmissionModalProps {
    submission: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SubmissionModal({ submission, onClose, onSuccess }: SubmissionModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const asm = submission.assignment;
    const isLate = new Date() > new Date(asm.dueDate);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }

            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png',
                'image/jpg',
            ];

            if (!allowedTypes.includes(file.type)) {
                setError('Only PDF, DOCX, and images are allowed');
                return;
            }

            setSelectedFile(file);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const formData = new FormData();
            formData.append('attachment', selectedFile);
            formData.append('remarks', remarks);

            const result = await assignmentAPI.submitAssignment(submission.id, formData);

            if (result.success) {
                onSuccess();
            } else {
                throw new Error(result.message || 'Failed to submit assignment');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            setError(error.message || 'Failed to submit assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl z-[101] p-10 animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">
                                Turn In Work
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{asm.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {isLate && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                        <AlertCircle className="text-amber-600" size={20} />
                        <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-tight">
                            Warning: This submission will be marked as LATE.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={20} />
                        <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!selectedFile ? (
                        <label className="block w-full p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl hover:border-indigo-400 hover:bg-indigo-50/10 transition-all cursor-pointer group">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                            />
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="text-slate-400 group-hover:text-indigo-500" size={32} />
                                </div>
                                <p className="font-black text-slate-700 dark:text-slate-200 mb-1 uppercase text-sm">
                                    Click to select file
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                    PDF, DOCX, or Image (Max 10MB)
                                </p>
                            </div>
                        </label>
                    ) : (
                        <div className="p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 dark:text-slate-100 text-sm truncate max-w-[200px]">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedFile(null)}
                                className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 hover:scale-110 transition-transform"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                            Add Remarks (Optional)
                        </label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Any comments for your teacher..."
                            rows={3}
                            className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !selectedFile}
                        className="w-full px-8 py-5 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 transform active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={22} className="animate-spin" />
                                SUBMITTING...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={22} />
                                TURN IN ASSIGNMENT
                            </>
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}
