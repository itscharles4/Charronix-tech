
import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Check, X, Clock, Send, Users, Loader2 } from 'lucide-react';
import { AttendanceStatus } from '../types';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  rollNo: number;
  class: string;
  section: string;
}

const AttendanceMarker: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedClass, setSelectedClass] = useState('1-A');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Build list of all class-section combos
  useEffect(() => {
    const classes: string[] = [];
    const secs = ['A', 'B'];
    for (let c = 1; c <= 10; c++) {
      for (const s of secs) {
        classes.push(`${c}-${s}`);
      }
    }
    setAvailableClasses(classes);
  }, []);

  // Fetch students when selected class changes
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    setPostResult(null);
    try {
      const [cls, sec] = selectedClass.split('-');
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `http://localhost:5000/api/v1/students?class=${cls}&section=${sec}&limit=100&sortBy=rollNo&sortOrder=asc`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      const json = await res.json();
      if (json.success && json.data) {
        setStudents(json.data);
        // Initialize all as PRESENT
        const initial: Record<string, AttendanceStatus> = {};
        json.data.forEach((s: Student) => { initial[s.id] = 'PRESENT'; });
        setAttendance(initial);
      } else {
        setStudents([]);
        setAttendance({});
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
      setAttendance({});
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const newAtt: Record<string, AttendanceStatus> = {};
    students.forEach(s => { newAtt[s.id] = status; });
    setAttendance(newAtt);
  };

  const handlePostRecords = async () => {
    if (students.length === 0) return;
    setPosting(true);
    setPostResult(null);
    try {
      const token = localStorage.getItem('accessToken');
      const records = students.map(s => ({
        studentId: s.id,
        status: attendance[s.id] || 'PRESENT',
      }));

      const res = await fetch('http://localhost:5000/api/v1/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ date, classSection: selectedClass, records }),
      });

      const json = await res.json();
      if (json.success) {
        setPostResult({ type: 'success', msg: `Attendance posted for ${records.length} students!` });
        setTimeout(() => setPostResult(null), 5000);
      } else {
        setPostResult({ type: 'error', msg: json.message || 'Failed to post attendance' });
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

  const stats = {
    total: students.length,
    present: Object.values(attendance).filter(s => s === 'PRESENT').length,
    absent: Object.values(attendance).filter(s => s === 'ABSENT').length,
    late: Object.values(attendance).filter(s => s === 'LATE').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Header Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between transition-colors">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-3 pr-12 font-black text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-12 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => markAll('PRESENT')}
            className="flex-1 md:flex-none text-xs font-black px-6 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl border border-green-100 dark:border-green-800 hover:bg-green-100 transition-all uppercase tracking-widest"
          >
            Mark All Present
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs font-black px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800 outline-none uppercase"
          />
        </div>
      </div>

      {/* Attendance Stats Bar */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
          <Users size={16} /> Total: {stats.total}
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-green-200 dark:border-green-800">
          <Check size={16} /> Present: {stats.present}
        </div>
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-red-200 dark:border-red-800">
          <X size={16} /> Absent: {stats.absent}
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 uppercase tracking-widest border border-amber-200 dark:border-amber-800">
          <Clock size={16} /> Late: {stats.late}
        </div>
      </div>

      {/* Post Result Toast */}
      {postResult && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fadeIn ${postResult.type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${postResult.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}>
            {postResult.type === 'success' ? '✓' : '!'}
          </div>
          <p className={`text-sm font-black ${postResult.type === 'success'
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-red-700 dark:text-red-400'
            }`}>{postResult.msg}</p>
        </div>
      )}

      {/* Loading State */}
      {loadingStudents ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="animate-spin text-indigo-500" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading students for {selectedClass}...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Users size={48} className="text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No students found in {selectedClass}</p>
        </div>
      ) : (
        /* Student List */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {student.rollNo}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 leading-tight text-lg">{student.firstName} {student.lastName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{student.admissionNo}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(student.id, 'PRESENT')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${attendance[student.id] === 'PRESENT'
                    ? 'bg-green-500 text-white shadow-xl shadow-green-200 dark:shadow-none scale-110'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/40 hover:text-green-500'
                    }`}
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => handleStatusChange(student.id, 'LATE')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${attendance[student.id] === 'LATE'
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-200 dark:shadow-none scale-110'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/40 hover:text-amber-500'
                    }`}
                >
                  <Clock size={20} />
                </button>
                <button
                  onClick={() => handleStatusChange(student.id, 'ABSENT')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${attendance[student.id] === 'ABSENT'
                    ? 'bg-red-500 text-white shadow-xl shadow-red-200 dark:shadow-none scale-110'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-500'
                    }`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      {students.length > 0 && (
        <div className="fixed bottom-10 right-10 flex justify-end">
          <button
            onClick={handlePostRecords}
            disabled={posting}
            className={`flex items-center gap-3 text-white px-10 py-5 rounded-full shadow-2xl transition-all font-black text-lg group ${posting
              ? 'bg-slate-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 shadow-indigo-300 dark:shadow-none hover:bg-indigo-700 active:scale-95'
              }`}
          >
            {posting ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>Post Records</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarker;
