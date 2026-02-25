
import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronDown, Search, Loader2, Upload, Check, AlertCircle } from 'lucide-react';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    rollNo: number;
    class: string;
    section: string;
}

const EXAM_TYPES = ['Term 1', 'Term 2', 'Midterm Examination', 'Final Examination', 'Unit Test 1', 'Unit Test 2'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Geography', 'Computer Science', 'Physical Education'];

const calcGrade = (score: number, max: number): { grade: string; color: string } => {
    const pct = (score / max) * 100;
    if (pct >= 90) return { grade: 'A+', color: 'text-emerald-600 dark:text-emerald-400' };
    if (pct >= 80) return { grade: 'A', color: 'text-green-600 dark:text-green-400' };
    if (pct >= 70) return { grade: 'B+', color: 'text-blue-600 dark:text-blue-400' };
    if (pct >= 60) return { grade: 'B', color: 'text-sky-600 dark:text-sky-400' };
    if (pct >= 50) return { grade: 'C+', color: 'text-amber-600 dark:text-amber-400' };
    if (pct >= 40) return { grade: 'C', color: 'text-orange-600 dark:text-orange-400' };
    return { grade: 'F', color: 'text-red-600 dark:text-red-400' };
};

const MarksUploader: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedClass, setSelectedClass] = useState('1-A');
    const [examType, setExamType] = useState('Term 1');
    const [subject, setSubject] = useState('Mathematics');
    const [maxScore, setMaxScore] = useState(100);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [posting, setPosting] = useState(false);
    const [postResult, setPostResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const availableClasses: string[] = [];
    for (let c = 1; c <= 10; c++) {
        availableClasses.push(`${c}-A`, `${c}-B`);
    }

    // Fetch students when class changes
    const fetchStudents = useCallback(async () => {
        setLoadingStudents(true);
        setPostResult(null);
        try {
            const [cls, sec] = selectedClass.split('-');
            const token = localStorage.getItem('accessToken');
            const res = await fetch(
                `http://localhost:5000/api/v1/students?class=${cls}&section=${sec}&limit=100&sortBy=rollNo&sortOrder=asc`,
                { headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' } }
            );
            const json = await res.json();
            if (json.success && json.data) {
                setStudents(json.data);
                const initial: Record<string, number> = {};
                json.data.forEach((s: Student) => { initial[s.id] = 0; });
                setScores(initial);
            } else {
                setStudents([]);
                setScores({});
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
            setStudents([]);
            setScores({});
        } finally {
            setLoadingStudents(false);
        }
    }, [selectedClass]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const handleScoreChange = (studentId: string, value: string) => {
        const num = parseInt(value) || 0;
        setScores(prev => ({ ...prev, [studentId]: Math.min(Math.max(0, num), maxScore) }));
    };

    const handleSubmit = async () => {
        if (students.length === 0) return;
        setPosting(true);
        setPostResult(null);
        try {
            const token = localStorage.getItem('accessToken');
            const records = students.map(s => ({ studentId: s.id, score: scores[s.id] || 0 }));

            const res = await fetch('http://localhost:5000/api/v1/grades/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                body: JSON.stringify({
                    subject,
                    term: examType,
                    academicYear: '2025-26',
                    maxScore,
                    records,
                }),
            });

            const json = await res.json();
            if (json.success) {
                setPostResult({ type: 'success', msg: `Marks saved for ${records.length} students in ${subject} — ${examType}!` });
                setTimeout(() => setPostResult(null), 6000);
            } else {
                setPostResult({ type: 'error', msg: json.message || 'Failed to save marks' });
            }
        } catch (err: any) {
            setPostResult({ type: 'error', msg: err.message || 'Network error' });
        } finally {
            setPosting(false);
        }
    };

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const enteredCount = Object.values(scores).filter(v => v > 0).length;
    const avgScore = enteredCount > 0
        ? (Object.values(scores).reduce((a, b) => a + b, 0) / students.length).toFixed(1)
        : '0';

    return (
        <div className="space-y-6 animate-fadeIn pb-24">
            {/* Header Controls */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex flex-wrap gap-4 items-center mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-300 dark:shadow-none">
                            <BookOpen size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Upload Marks</h3>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Class */}
                    <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Class</label>
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 font-black text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                        >
                            {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 bottom-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Exam Type */}
                    <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Exam Type</label>
                        <select
                            value={examType}
                            onChange={e => setExamType(e.target.value)}
                            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 font-black text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                        >
                            {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 bottom-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Subject */}
                    <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Subject</label>
                        <select
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 font-black text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                        >
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 bottom-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Max Score */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Max Marks</label>
                        <input
                            type="number"
                            value={maxScore}
                            onChange={e => setMaxScore(Math.max(1, parseInt(e.target.value) || 100))}
                            min={1}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-black text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Filter</label>
                        <Search size={16} className="absolute left-3 bottom-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-9 font-black text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-purple-200 dark:border-purple-800">
                    <BookOpen size={16} /> {subject} — {examType}
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
                    Students: {students.length}
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-green-200 dark:border-green-800">
                    Entered: {enteredCount}/{students.length}
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                    Avg: {avgScore}/{maxScore}
                </div>
            </div>

            {/* Result Toast */}
            {postResult && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fadeIn ${postResult.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${postResult.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}>
                        {postResult.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <p className={`text-sm font-black ${postResult.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                        }`}>{postResult.msg}</p>
                </div>
            )}

            {/* Loading / Empty */}
            {loadingStudents ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 size={40} className="animate-spin text-purple-500" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading students for {selectedClass}...</p>
                </div>
            ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <BookOpen size={48} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No students found in {selectedClass}</p>
                </div>
            ) : (
                /* Marks Table */
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission No</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Marks Obtained</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredStudents.map(student => {
                                    const score = scores[student.id] || 0;
                                    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                                    const { grade, color } = calcGrade(score, maxScore);

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center font-black text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                                    {student.rollNo}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-slate-800 dark:text-slate-100 text-lg">{student.firstName} {student.lastName}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.admissionNo}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={score}
                                                        onChange={e => handleScoreChange(student.id, e.target.value)}
                                                        min={0}
                                                        max={maxScore}
                                                        className="w-20 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-black text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                                    />
                                                    <span className="text-sm font-bold text-slate-400">/ {maxScore}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-500">{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-2xl font-black ${color}`}>{grade}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Floating Save Button */}
            {students.length > 0 && (
                <div className="fixed bottom-10 right-10 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={posting}
                        className={`flex items-center gap-3 text-white px-10 py-5 rounded-full shadow-2xl transition-all font-black text-lg group ${posting
                                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-purple-600 shadow-purple-300 dark:shadow-none hover:bg-purple-700 active:scale-95'
                            }`}
                    >
                        {posting ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={24} className="group-hover:translate-y-[-2px] transition-transform" />
                                <span>Save Marks</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MarksUploader;
