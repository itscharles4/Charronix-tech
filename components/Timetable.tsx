import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, User, Clock } from 'lucide-react';
import { studentAPI } from '../services/api';

interface TimetableEntry {
    id: string;
    dayOfWeek: string;
    period: number;
    periodTime: string;
    subject: string;
    teacherName: string;
    type: string;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const SUBJECT_STYLES: Record<string, string> = {
    'MAT': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'ENG': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'SCI': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'HIN': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'SST': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'MUS': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'ART': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'PE': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'CS': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    'MOR': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'BREAK': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 italic',
    'LUNCH': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 italic font-bold',
    'FREE': 'bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500',
};

const Timetable: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const response = await studentAPI.getTimetable();
                if (response.success) {
                    setEntries(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch timetable:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                <p className="text-slate-500 font-bold">Loading Timetable...</p>
            </div>
        );
    }

    const getEntry = (day: string, period: number) => {
        return entries.find(e => e.dayOfWeek === day && e.period === period);
    };

    const getBreak = (day: string, type: 'BREAK' | 'LUNCH') => {
        return entries.find(e => (e.dayOfWeek === day || e.dayOfWeek === 'ALL') && e.subject === type);
    };

    const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden';

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className={`${card}`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="p-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">Period</th>
                                {DAYS.map(day => (
                                    <th key={day} className="p-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {PERIODS.map((period) => (
                                <React.Fragment key={period}>
                                    {/* Period Row */}
                                    <tr className="group">
                                        <td className="p-4 bg-slate-50/30 dark:bg-slate-800/20">
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-black text-slate-800 dark:text-slate-200">P{period}</span>
                                                <span className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                                    <Clock size={10} /> {getEntry(DAYS[0], period)?.periodTime || '--:--'}
                                                </span>
                                            </div>
                                        </td>
                                        {DAYS.map(day => {
                                            const entry = getEntry(day, period);
                                            const style = SUBJECT_STYLES[entry?.subject || 'FREE'] || SUBJECT_STYLES['FREE'];
                                            return (
                                                <td key={day} className="p-2 align-middle">
                                                    <div className={`rounded-2xl p-3 h-full flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] ${style}`}>
                                                        <span className="text-xs font-black tracking-tight">{entry?.subject || 'FREE'}</span>
                                                        {entry?.teacherName && entry.teacherName !== '-' && (
                                                            <span className="text-[9px] font-bold mt-1 opacity-70 flex items-center gap-1">
                                                                <User size={10} /> {entry.teacherName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Inter-period Breaks */}
                                    {period === 2 && (
                                        <tr className="bg-amber-50/30 dark:bg-amber-900/5">
                                            <td className="p-2 text-center" colSpan={7}>
                                                <div className="flex items-center justify-center gap-2 py-1">
                                                    <div className="h-px bg-amber-200 dark:bg-amber-900/30 flex-1" />
                                                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-1">
                                                        <Clock size={12} /> Short Break (10 min)
                                                    </span>
                                                    <div className="h-px bg-amber-200 dark:bg-amber-900/30 flex-1" />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {period === 5 && (
                                        <tr className="bg-rose-50/30 dark:bg-rose-900/5">
                                            <td className="p-2 text-center" colSpan={7}>
                                                <div className="flex items-center justify-center gap-2 py-1">
                                                    <div className="h-px bg-rose-200 dark:bg-rose-900/30 flex-1" />
                                                    <span className="text-[10px] font-black uppercase text-rose-600 tracking-widest flex items-center gap-1">
                                                        <Clock size={12} /> Lunch Break (40 min)
                                                    </span>
                                                    <div className="h-px bg-rose-200 dark:bg-rose-900/30 flex-1" />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {period === 7 && (
                                        <tr className="bg-amber-50/30 dark:bg-amber-900/5">
                                            <td className="p-2 text-center" colSpan={7}>
                                                <div className="flex items-center justify-center gap-2 py-1">
                                                    <div className="h-px bg-amber-200 dark:bg-amber-900/30 flex-1" />
                                                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-1">
                                                        <Clock size={12} /> Short Break (10 min)
                                                    </span>
                                                    <div className="h-px bg-amber-200 dark:bg-amber-900/30 flex-1" />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
