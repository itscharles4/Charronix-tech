
import React, { useState, useMemo } from 'react';
import {
    Users,
    Search,
    BookOpen,
    ChevronDown,
    ChevronUp,
    GraduationCap,
    Clock,
    Calendar,
    Award,
    Mail,
    Phone,
    Briefcase,
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
import { DEF_TEACHERS, DEF_SUBJECTS, LEVEL_INFO, SC } from './TimetableGenerator';

interface Props {
    isDarkMode: boolean;
}

const TeacherManagement: React.FC<Props> = ({ isDarkMode }) => {
    const [levelFilter, setLevelFilter] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'level' | 'workload'>('level');

    const teachers = DEF_TEACHERS;
    const subjects = DEF_SUBJECTS;

    // Filter teachers
    const filtered = useMemo(() => {
        let result = [...teachers];
        if (levelFilter !== 0) result = result.filter(t => t.level === levelFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.id.toLowerCase().includes(q) ||
                t.subjectIds.some(sid => {
                    const s = subjects.find(x => x.id === sid);
                    return s?.name.toLowerCase().includes(q);
                })
            );
        }
        if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
        if (sortBy === 'workload') result.sort((a, b) => b.maxPeriodsPerWeek - a.maxPeriodsPerWeek);
        return result;
    }, [teachers, levelFilter, searchQuery, sortBy]);

    // Stats
    const totalTeachers = teachers.length;
    const levelCounts = [1, 2, 3, 4].map(l => teachers.filter(t => t.level === l).length);
    const uniqueSubjects = new Set(teachers.flatMap(t => t.subjectIds));

    // Subject coverage chart data
    const coverageData = useMemo(() => {
        return subjects.map(s => ({
            name: s.code,
            fullName: s.name,
            teachers: teachers.filter(t => t.subjectIds.includes(s.id)).length,
            color: SC[s.id]?.tx || '#475569',
            bgColor: SC[s.id]?.bg || '#f1f5f9',
        })).sort((a, b) => b.teachers - a.teachers);
    }, [teachers, subjects]);

    // Level distribution for the mini badges
    const levelColors: Record<number, string> = {
        1: '#22c55e', 2: '#3b82f6', 3: '#8b5cf6', 4: '#f59e0b',
    };

    const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';
    const chartText = isDarkMode ? '#94a3b8' : '#64748b';
    const gridStroke = isDarkMode ? '#1e293b' : '#f1f5f9';

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* ── Header Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Total Faculty', value: totalTeachers, icon: Users, color: 'bg-indigo-500', shadow: 'shadow-indigo-200 dark:shadow-none' },
                    { label: 'Senior & Lead', value: levelCounts[2] + levelCounts[3], icon: Award, color: 'bg-purple-500', shadow: 'shadow-purple-200 dark:shadow-none' },
                    { label: 'Associate & Certified', value: levelCounts[0] + levelCounts[1], icon: GraduationCap, color: 'bg-emerald-500', shadow: 'shadow-emerald-200 dark:shadow-none' },
                    { label: 'Subjects Covered', value: uniqueSubjects.size, icon: BookOpen, color: 'bg-amber-500', shadow: 'shadow-amber-200 dark:shadow-none' },
                ].map(stat => (
                    <div key={stat.label} className={`${card} p-6 flex items-center gap-5 hover:shadow-md transition-all`}>
                        <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg ${stat.shadow}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Level Distribution Mini Bars ── */}
            <div className={`${card} p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Faculty by Level</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{totalTeachers} total</span>
                </div>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-4">
                    {[1, 2, 3, 4].map(lv => (
                        <div
                            key={lv}
                            style={{
                                width: `${(levelCounts[lv - 1] / totalTeachers) * 100}%`,
                                backgroundColor: levelColors[lv],
                            }}
                            className="transition-all hover:opacity-80"
                            title={`${LEVEL_INFO[lv].name}: ${levelCounts[lv - 1]}`}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(lv => {
                        const info = LEVEL_INFO[lv];
                        return (
                            <div key={lv} className={`flex items-center gap-3 rounded-xl p-3 ${info.bg} transition-all hover:scale-[1.02]`}>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: levelColors[lv] }} />
                                <div>
                                    <p className={`text-xs font-black ${info.color}`}>{info.badge} · {info.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{info.classes} · {levelCounts[lv - 1]} teachers</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Subject Coverage Chart ── */}
                <div className={`${card} p-6 lg:col-span-1`}>
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-4">Subject Coverage</h3>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={coverageData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                                <XAxis type="number" tick={{ fill: chartText, fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" tick={{ fill: chartText, fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={40} />
                                <Tooltip
                                    cursor={{ fill: isDarkMode ? '#0f172a' : '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}
                                    formatter={(value: number, _: string, props: any) => [`${value} teachers`, props.payload.fullName]}
                                />
                                <Bar dataKey="teachers" radius={[0, 6, 6, 0]} name="Teachers">
                                    {coverageData.map((entry, i) => (
                                        <Cell key={i} fill={isDarkMode ? (SC[subjects.find(s => s.code === entry.name)?.id || '']?.dtx || '#94a3b8') : entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Teacher Directory ── */}
                <div className={`${card} p-6 lg:col-span-2`}>
                    {/* Search + Sort + Filter */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search teachers, subjects..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as any)}
                            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
                        >
                            <option value="level">Sort by Level</option>
                            <option value="name">Sort by Name</option>
                            <option value="workload">Sort by Workload</option>
                        </select>
                    </div>

                    {/* Level Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        <button
                            onClick={() => setLevelFilter(0)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${levelFilter === 0 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            All ({totalTeachers})
                        </button>
                        {[1, 2, 3, 4].map(lv => {
                            const info = LEVEL_INFO[lv];
                            const count = levelCounts[lv - 1];
                            return (
                                <button
                                    key={lv}
                                    onClick={() => setLevelFilter(lv)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${levelFilter === lv ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: levelColors[lv] }}
                                    />
                                    {info.badge} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Results count */}
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Showing {filtered.length} teacher{filtered.length !== 1 ? 's' : ''}
                    </p>

                    {/* Teacher List */}
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
                        {filtered.map(t => {
                            const lvInfo = LEVEL_INFO[t.level];
                            const isExpanded = expandedTeacher === t.id;
                            return (
                                <div key={t.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden transition-all hover:shadow-md">
                                    {/* Main row */}
                                    <button
                                        onClick={() => setExpandedTeacher(isExpanded ? null : t.id)}
                                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        {/* Avatar */}
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                                            style={{ backgroundColor: levelColors[t.level] }}
                                        >
                                            {t.name.split(' ').pop()?.[0] || 'T'}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">{t.name}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${lvInfo.bg} ${lvInfo.color}`}>{lvInfo.badge}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {t.subjectIds.map(sid => {
                                                    const s = subjects.find(x => x.id === sid);
                                                    const col = SC[sid] || { bg: '#f1f5f9', dk: '#1e293b', tx: '#475569', dtx: '#94a3b8' };
                                                    return (
                                                        <span
                                                            key={sid}
                                                            className="text-[10px] px-2 py-0.5 rounded-lg font-bold"
                                                            style={{
                                                                backgroundColor: isDarkMode ? col.dk : col.bg,
                                                                color: isDarkMode ? col.dtx : col.tx,
                                                            }}
                                                        >
                                                            {s?.name || sid}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Workload mini */}
                                        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                                            <div className="text-center">
                                                <p className="text-lg font-black text-slate-700 dark:text-slate-200">{t.maxPeriodsPerDay}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">/ Day</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-black text-slate-700 dark:text-slate-200">{t.maxPeriodsPerWeek}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">/ Week</p>
                                            </div>
                                        </div>

                                        {/* Expand icon */}
                                        <div className="text-slate-400 flex-shrink-0">
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </button>

                                    {/* Expanded Detail Panel */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 animate-fadeIn">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                                                {/* Column 1: Profile */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Briefcase size={14} className="text-slate-400" />
                                                            <span className="font-bold text-slate-600 dark:text-slate-300">ID: {t.id}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Award size={14} className="text-slate-400" />
                                                            <span className="font-bold text-slate-600 dark:text-slate-300">{lvInfo.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <GraduationCap size={14} className="text-slate-400" />
                                                            <span className="font-bold text-slate-600 dark:text-slate-300">{lvInfo.classes}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 2: Workload */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workload</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock size={14} className="text-slate-400" />
                                                            <span className="font-bold text-slate-600 dark:text-slate-300">Max {t.maxPeriodsPerDay} periods/day</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            <span className="font-bold text-slate-600 dark:text-slate-300">Max {t.maxPeriodsPerWeek} periods/week</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <BookOpen size={14} className="text-slate-400" />
                                                            <span className="font-bold text-slate-600 dark:text-slate-300">Max {t.maxConsecutive} consecutive</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 3: Availability */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Availability</h4>
                                                    {t.unavailableSlots.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {t.unavailableSlots.map((slot, i) => (
                                                                <div key={i} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-bold">
                                                                    {slot.day} · Period {slot.period}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                                            <span className="text-sm font-bold text-green-600 dark:text-green-400">Fully Available</span>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2 mt-2">
                                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[11px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                                                            <Mail size={12} /> Email
                                                        </button>
                                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                                                            <Phone size={12} /> Call
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Users size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 font-bold">No teachers match your filters</p>
                            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or level filter</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherManagement;
