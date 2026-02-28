import { useState } from 'react';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { assignmentAPI } from '../../services/api';

export default function CreateAssignment() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        class: '',
        section: '',
        dueDate: '',
        maxMarks: '',
        allowLateSubmission: true,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const sections = ['A', 'B', 'C', 'D'];
    const subjects = [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English',
        'Hindi',
        'History',
        'Geography',
        'Computer Science',
        'Physical Education',
    ];

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

    const removeFile = () => {
        setSelectedFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.title || !formData.description || !formData.subject || !formData.class || !formData.dueDate) {
                throw new Error('Please fill all required fields');
            }

            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('subject', formData.subject);
            submitData.append('class', formData.class);
            if (formData.section) submitData.append('section', formData.section);
            submitData.append('dueDate', formData.dueDate);
            submitData.append('allowLateSubmission', formData.allowLateSubmission.toString());
            if (formData.maxMarks) submitData.append('maxMarks', formData.maxMarks);
            if (selectedFile) submitData.append('attachment', selectedFile);

            const result = await assignmentAPI.createAssignment(submitData);

            if (result.success) {
                setSuccess(true);
                setFormData({
                    title: '',
                    description: '',
                    subject: '',
                    class: '',
                    section: '',
                    dueDate: '',
                    maxMarks: '',
                    allowLateSubmission: true,
                });
                setSelectedFile(null);

                setTimeout(() => setSuccess(false), 3000);
            } else {
                throw new Error(result.message || 'Failed to create assignment');
            }
        } catch (error: any) {
            console.error('Error creating assignment:', error);
            setError(error.message || 'Failed to create assignment');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (file: File) => {
        if (file.type.includes('pdf')) return '📄';
        if (file.type.includes('word') || file.type.includes('document')) return '📝';
        if (file.type.includes('image')) return '🖼️';
        return '📎';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <Upload className="text-purple-600 dark:text-purple-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                            Create Assignment
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 font-medium">
                            Post new homework or project for your students
                        </p>
                    </div>
                </div>
            </div>

            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                    <p className="text-green-700 dark:text-green-300 font-bold">
                        Assignment created and notifications sent to students!
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
                    <X className="text-red-600 dark:text-red-400" size={24} />
                    <p className="text-red-700 dark:text-red-300 font-bold">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest px-1">
                            Assignment Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Mathematics - Chapter 4 Quadratics"
                            required
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 placeholder-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest px-1">
                            Instructions
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter detailed instructions here..."
                            rows={5}
                            required
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest px-1">
                                Subject
                            </label>
                            <select
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            >
                                <option value="">Select subject</option>
                                {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest px-1">
                                Class
                            </label>
                            <select
                                value={formData.class}
                                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                required
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            >
                                <option value="">Select class</option>
                                {classes.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest px-1">
                                Section
                            </label>
                            <select
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            >
                                <option value="">All Sections</option>
                                {sections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest px-1">
                                Due Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest px-1">
                                Max Marks
                            </label>
                            <input
                                type="number"
                                value={formData.maxMarks}
                                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                                placeholder="e.g., 100"
                                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 placeholder-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <input
                            type="checkbox"
                            id="allowLate"
                            checked={formData.allowLateSubmission}
                            onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                            className="w-6 h-6 rounded-lg border-slate-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="allowLate" className="font-bold text-slate-700 dark:text-slate-200 cursor-pointer text-sm">
                            Allow late submissions after due date
                        </label>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest px-1">
                            Question Paper / Attachment
                        </label>

                        {!selectedFile ? (
                            <label className="block w-full p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:border-purple-400 hover:bg-purple-50/10 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    className="hidden"
                                />
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="text-slate-400 group-hover:text-purple-500" size={32} />
                                    </div>
                                    <p className="font-black text-slate-700 dark:text-slate-200 mb-1">
                                        Click to upload file
                                    </p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                        PDF, DOCX, or Image (Max 10MB)
                                    </p>
                                </div>
                            </label>
                        ) : (
                            <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">{getFileIcon(selectedFile)}</div>
                                    <div>
                                        <p className="font-black text-slate-800 dark:text-slate-100">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-slate-500 font-bold">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 hover:scale-105 transition-transform"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-lg shadow-xl shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
                >
                    {loading ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            POSTING ASSIGNMENT...
                        </>
                    ) : (
                        <>
                            <Upload size={24} />
                            POST ASSIGNMENT
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
