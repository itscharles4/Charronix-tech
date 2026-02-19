
import React, { useState } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Sparkles, BookOpen, Clock, ShieldCheck, Wand2, Plus, Trash2, Check, Users, GraduationCap, Printer, RotateCcw, AlertTriangle } from 'lucide-react';
import { TimetableClass, TimetableSubject, TimetableTeacher, SchoolTimings, ConstraintSettings, TimetableEntry, SectionSchedule, GeneratedTimetable } from '../types';

interface Props { isDarkMode: boolean; }

// ===== SUBJECT COLORS =====
export const SC: Record<string, { bg: string; dk: string; tx: string; dtx: string }> = {
    math: { bg: '#dbeafe', dk: '#1e3a5f', tx: '#1e40af', dtx: '#93c5fd' },
    science: { bg: '#f3e8ff', dk: '#3b1f5e', tx: '#6d28d9', dtx: '#c4b5fd' },
    english: { bg: '#d1fae5', dk: '#064e3b', tx: '#065f46', dtx: '#6ee7b7' },
    hindi: { bg: '#ffedd5', dk: '#7c2d12', tx: '#c2410c', dtx: '#fdba74' },
    sst: { bg: '#fef3c7', dk: '#78350f', tx: '#b45309', dtx: '#fcd34d' },
    cs: { bg: '#cffafe', dk: '#164e63', tx: '#0e7490', dtx: '#67e8f9' },
    pe: { bg: '#dcfce7', dk: '#14532d', tx: '#15803d', dtx: '#86efac' },
    art: { bg: '#fce7f3', dk: '#831843', tx: '#be185d', dtx: '#f9a8d4' },
    music: { bg: '#ede9fe', dk: '#4c1d95', tx: '#5b21b6', dtx: '#a78bfa' },
    moral: { bg: '#e0e7ff', dk: '#312e81', tx: '#3730a3', dtx: '#a5b4fc' },
};
const DC = { bg: '#f1f5f9', dk: '#1e293b', tx: '#475569', dtx: '#94a3b8' };

// ===== DEFAULT DATA =====
const DEF_CLASSES: TimetableClass[] = [
    { id: 'c1', name: 'Class 1', sections: [{ id: '1A', name: 'A', studentCount: 35, roomNumber: '101' }, { id: '1B', name: 'B', studentCount: 35, roomNumber: '102' }] },
    { id: 'c2', name: 'Class 2', sections: [{ id: '2A', name: 'A', studentCount: 36, roomNumber: '103' }, { id: '2B', name: 'B', studentCount: 35, roomNumber: '104' }] },
    { id: 'c3', name: 'Class 3', sections: [{ id: '3A', name: 'A', studentCount: 38, roomNumber: '105' }, { id: '3B', name: 'B', studentCount: 36, roomNumber: '106' }] },
    { id: 'c4', name: 'Class 4', sections: [{ id: '4A', name: 'A', studentCount: 38, roomNumber: '201' }, { id: '4B', name: 'B', studentCount: 38, roomNumber: '202' }] },
    { id: 'c5', name: 'Class 5', sections: [{ id: '5A', name: 'A', studentCount: 40, roomNumber: '203' }, { id: '5B', name: 'B', studentCount: 39, roomNumber: '204' }] },
    { id: 'c6', name: 'Class 6', sections: [{ id: '6A', name: 'A', studentCount: 40, roomNumber: '205' }, { id: '6B', name: 'B', studentCount: 40, roomNumber: '206' }] },
    { id: 'c7', name: 'Class 7', sections: [{ id: '7A', name: 'A', studentCount: 40, roomNumber: '301' }, { id: '7B', name: 'B', studentCount: 40, roomNumber: '302' }] },
    { id: 'c8', name: 'Class 8', sections: [{ id: '8A', name: 'A', studentCount: 40, roomNumber: '303' }, { id: '8B', name: 'B', studentCount: 38, roomNumber: '304' }] },
    { id: 'c9', name: 'Class 9', sections: [{ id: '9A', name: 'A', studentCount: 42, roomNumber: '401' }, { id: '9B', name: 'B', studentCount: 40, roomNumber: '402' }] },
    { id: 'c10', name: 'Class 10', sections: [{ id: '10A', name: 'A', studentCount: 40, roomNumber: '403' }, { id: '10B', name: 'B', studentCount: 38, roomNumber: '404' }] },
    { id: 'c11', name: 'Class 11', sections: [{ id: '11A', name: 'A', studentCount: 38, roomNumber: '501' }, { id: '11B', name: 'B', studentCount: 36, roomNumber: '502' }] },
    { id: 'c12', name: 'Class 12', sections: [{ id: '12A', name: 'A', studentCount: 36, roomNumber: '503' }, { id: '12B', name: 'B', studentCount: 35, roomNumber: '504' }] },
];

export const DEF_SUBJECTS: TimetableSubject[] = [
    { id: 'math', name: 'Mathematics', code: 'MAT', type: 'core', periodsPerWeek: 6, requiresLab: false, maxConsecutive: 2, preferredTime: 'morning' },
    { id: 'science', name: 'Science', code: 'SCI', type: 'core', periodsPerWeek: 6, requiresLab: true, maxConsecutive: 2, preferredTime: 'morning' },
    { id: 'english', name: 'English', code: 'ENG', type: 'language', periodsPerWeek: 6, requiresLab: false, maxConsecutive: 2, preferredTime: 'morning' },
    { id: 'hindi', name: 'Hindi', code: 'HIN', type: 'language', periodsPerWeek: 5, requiresLab: false, maxConsecutive: 2, preferredTime: 'any' },
    { id: 'sst', name: 'Social Studies', code: 'SST', type: 'core', periodsPerWeek: 5, requiresLab: false, maxConsecutive: 2, preferredTime: 'any' },
    { id: 'cs', name: 'Computer Science', code: 'CS', type: 'elective', periodsPerWeek: 3, requiresLab: true, maxConsecutive: 2, preferredTime: 'afternoon' },
    { id: 'pe', name: 'Physical Education', code: 'PE', type: 'activity', periodsPerWeek: 3, requiresLab: false, maxConsecutive: 2, preferredTime: 'afternoon' },
    { id: 'art', name: 'Art & Craft', code: 'ART', type: 'activity', periodsPerWeek: 2, requiresLab: false, maxConsecutive: 2, preferredTime: 'afternoon' },
    { id: 'music', name: 'Music', code: 'MUS', type: 'activity', periodsPerWeek: 2, requiresLab: false, maxConsecutive: 1, preferredTime: 'afternoon' },
    { id: 'moral', name: 'Moral Science', code: 'MOR', type: 'core', periodsPerWeek: 2, requiresLab: false, maxConsecutive: 1, preferredTime: 'any' },
];

export const DEF_TEACHERS: TimetableTeacher[] = [
    // ── Level 1: Associate Teacher (Class 1-3) ── 14 faculty
    { id: 'L1T01', name: 'Mrs. Rani Devi', subjectIds: ['math'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T02', name: 'Mr. Suresh Yadav', subjectIds: ['math'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T03', name: 'Mrs. Kavita Mishra', subjectIds: ['science'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T04', name: 'Mr. Deepak Tiwari', subjectIds: ['science'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T05', name: 'Mrs. Neha Agarwal', subjectIds: ['english'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T06', name: 'Mr. Amit Pandey', subjectIds: ['english'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T07', name: 'Mrs. Sunita Kumari', subjectIds: ['hindi'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T08', name: 'Mrs. Meena Jha', subjectIds: ['hindi', 'moral'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T09', name: 'Mr. Ravi Prasad', subjectIds: ['sst'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T10', name: 'Mr. Alok Verma', subjectIds: ['sst', 'moral'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T11', name: 'Mrs. Pooja Sinha', subjectIds: ['cs'], level: 1, maxPeriodsPerDay: 5, maxPeriodsPerWeek: 25, unavailableSlots: [], maxConsecutive: 2 },
    { id: 'L1T12', name: 'Mr. Ajay Chauhan', subjectIds: ['pe'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T13', name: 'Mrs. Nisha Rawat', subjectIds: ['art'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L1T14', name: 'Mr. Rohit Gupta', subjectIds: ['music'], level: 1, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    // ── Level 2: Certified Teacher (Class 4-6) ── 14 faculty
    { id: 'L2T01', name: 'Mrs. Anjali Dubey', subjectIds: ['math'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T02', name: 'Mr. Vikram Saxena', subjectIds: ['math'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T03', name: 'Mrs. Rekha Pillai', subjectIds: ['science'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T04', name: 'Mr. Sunil Nair', subjectIds: ['science'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T05', name: 'Mrs. Divya Menon', subjectIds: ['english'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T06', name: 'Mr. Arjun Rao', subjectIds: ['english'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T07', name: 'Mrs. Geeta Chandra', subjectIds: ['hindi'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T08', name: 'Mrs. Radha Sharma', subjectIds: ['hindi', 'moral'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T09', name: 'Mr. Sanjay Bhatt', subjectIds: ['sst'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T10', name: 'Mr. Manish Tomar', subjectIds: ['sst', 'moral'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T11', name: 'Mr. Karthik Rajan', subjectIds: ['cs'], level: 2, maxPeriodsPerDay: 5, maxPeriodsPerWeek: 25, unavailableSlots: [], maxConsecutive: 2 },
    { id: 'L2T12', name: 'Mrs. Priya Desai', subjectIds: ['pe'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T13', name: 'Mrs. Sapna Malik', subjectIds: ['art'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L2T14', name: 'Mr. Nitin Bhatia', subjectIds: ['music'], level: 2, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    // ── Level 3: Senior Teacher (Class 7-9) ── 14 faculty
    { id: 'L3T01', name: 'Mrs. Sharma', subjectIds: ['math'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T02', name: 'Mrs. Mehra', subjectIds: ['math'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T03', name: 'Mr. Kumar', subjectIds: ['science'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T04', name: 'Mrs. Verma', subjectIds: ['science'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T05', name: 'Ms. Gupta', subjectIds: ['english'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T06', name: 'Mr. Kapoor', subjectIds: ['english'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T07', name: 'Mr. Singh', subjectIds: ['hindi'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T08', name: 'Mrs. Bansal', subjectIds: ['hindi', 'moral'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T09', name: 'Mrs. Patel', subjectIds: ['sst'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T10', name: 'Mr. Joshi', subjectIds: ['sst', 'moral'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T11', name: 'Mr. Iyer', subjectIds: ['cs'], level: 3, maxPeriodsPerDay: 5, maxPeriodsPerWeek: 25, unavailableSlots: [], maxConsecutive: 2 },
    { id: 'L3T12', name: 'Mr. Reddy', subjectIds: ['pe'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T13', name: 'Mrs. Das', subjectIds: ['art'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L3T14', name: 'Mr. Basu', subjectIds: ['music'], level: 3, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    // ── Level 4: Lead Educator (Class 10-12) ── 14 faculty
    { id: 'L4T01', name: 'Dr. Anita Khanna', subjectIds: ['math'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T02', name: 'Mr. Rajesh Malhotra', subjectIds: ['math'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T03', name: 'Dr. Pradeep Bose', subjectIds: ['science'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T04', name: 'Mrs. Lakshmi Iyer', subjectIds: ['science'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T05', name: 'Dr. Shalini Kapur', subjectIds: ['english'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T06', name: 'Mr. Vivek Tandon', subjectIds: ['english'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T07', name: 'Mrs. Usha Deshpande', subjectIds: ['hindi'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T08', name: 'Dr. Ritu Ahuja', subjectIds: ['hindi', 'moral'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T09', name: 'Dr. Manoj Tripathi', subjectIds: ['sst'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T10', name: 'Mr. Ashok Srivastava', subjectIds: ['sst', 'moral'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T11', name: 'Mr. Gaurav Mehta', subjectIds: ['cs'], level: 4, maxPeriodsPerDay: 5, maxPeriodsPerWeek: 25, unavailableSlots: [], maxConsecutive: 2 },
    { id: 'L4T12', name: 'Mr. Harish Negi', subjectIds: ['pe'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T13', name: 'Mrs. Chitra Mohan', subjectIds: ['art'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
    { id: 'L4T14', name: 'Mr. Pranav Kulkarni', subjectIds: ['music'], level: 4, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 },
];

const DEF_TIMINGS: SchoolTimings = {
    startTime: '08:00', endTime: '14:30',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    periodsPerDay: 8, periodDuration: 40,
    breaks: [
        { name: 'Short Break', afterPeriod: 2, duration: 10 },
        { name: 'Lunch Break', afterPeriod: 5, duration: 40 },
        { name: 'Short Break', afterPeriod: 7, duration: 10 },
    ],
};

const DEF_CONSTRAINTS: ConstraintSettings = {
    respectUnavailability: true, labConsecutive: true, maxPeriodsPerDayPerSubject: 2,
    difficultMorning: true, activityAfternoon: true, balancedLoad: true, minimizeGaps: true, maxConsecutiveSame: 2,
};

const STEPS = [
    { id: 1, title: 'Classes', icon: GraduationCap },
    { id: 2, title: 'Subjects', icon: BookOpen },
    { id: 3, title: 'Teachers', icon: Users },
    { id: 4, title: 'Timings', icon: Clock },
    { id: 5, title: 'Rules', icon: ShieldCheck },
    { id: 6, title: 'Generate', icon: Wand2 },
];

const TYPE_BADGES: Record<string, string> = {
    core: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    language: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    elective: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    activity: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

export const LEVEL_INFO: Record<number, { name: string; badge: string; classes: string; color: string; bg: string }> = {
    1: { name: 'Associate Teacher', badge: 'L1', classes: 'Class 1-3', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/40' },
    2: { name: 'Certified Teacher', badge: 'L2', classes: 'Class 4-6', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/40' },
    3: { name: 'Senior Teacher', badge: 'L3', classes: 'Class 7-9', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/40' },
    4: { name: 'Lead Educator', badge: 'L4', classes: 'Class 10-12', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/40' },
};

function getRequiredLevel(className: string): number {
    const num = parseInt(className.replace(/\D/g, ''));
    if (num <= 3) return 1;
    if (num <= 6) return 2;
    if (num <= 9) return 3;
    return 4;
}

// ===== SOLVER (Task-Driven CSP with Local Search) =====
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

function solveTimetable(classes: TimetableClass[], subjects: TimetableSubject[], teachers: TimetableTeacher[], timings: SchoolTimings, constraints: ConstraintSettings): GeneratedTimetable {
    const days = timings.workingDays;
    const nPeriods = timings.periodsPerDay;
    const allSections = classes.flatMap(c => c.sections.map(s => ({ id: s.id, classId: c.id, className: c.name, sectionName: s.name })));

    let best: GeneratedTimetable | null = null;
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < 80; attempt++) {
        // Global teacher tracking
        const tSlot: Record<string, Record<string, Set<number>>> = {};
        const tWeek: Record<string, number> = {};
        teachers.forEach(t => { tSlot[t.id] = {}; days.forEach(d => { tSlot[t.id][d] = new Set(); }); tWeek[t.id] = 0; });

        const schedules: SectionSchedule[] = [];
        const violations: string[] = [];
        let totalScore = 0;

        for (const sec of shuffle(allSections)) {
            const reqLevel = getRequiredLevel(sec.className);

            // Initialize empty grid
            const grid: Record<string, (TimetableEntry | null)[]> = {};
            days.forEach(d => { grid[d] = new Array(nPeriods).fill(null); });

            // Phase 1: Build task list (one task per subject-period needed)
            const tasks: TimetableSubject[] = [];
            for (const sub of subjects) {
                for (let i = 0; i < sub.periodsPerWeek; i++) tasks.push(sub);
            }

            // Sort by difficulty: fewer available teachers = harder, cores before activities
            const levelTeachers = teachers.filter(t => t.level === reqLevel);
            const diffMap: Record<string, number> = {};
            subjects.forEach(s => {
                const avail = levelTeachers.filter(t => t.subjectIds.includes(s.id)).length;
                diffMap[s.id] = 1000 / (avail + 0.5) + (s.preferredTime === 'morning' ? 50 : 0) + (s.type === 'core' ? 30 : 0);
            });
            // Sort hard-first, but add randomness to bottom half
            tasks.sort((a, b) => diffMap[b.id] - diffMap[a.id]);
            const cutoff = Math.ceil(tasks.length * 0.4);
            const hardTasks = tasks.slice(0, cutoff);
            const easyTasks = shuffle(tasks.slice(cutoff));
            const orderedTasks = [...hardTasks, ...easyTasks];

            // Phase 2: Assign each task to the best available slot
            for (const sub of orderedTasks) {
                let bestSlotScore = -Infinity;
                let bestDay = '';
                let bestPeriod = -1;
                let bestTeacher: TimetableTeacher | null = null;

                for (const day of days) {
                    // Subject-per-day limit
                    const subInDay = grid[day].filter(e => e?.subjectId === sub.id).length;
                    if (subInDay >= constraints.maxPeriodsPerDayPerSubject) continue;

                    for (let p = 0; p < nPeriods; p++) {
                        if (grid[day][p] !== null) continue; // slot taken

                        // Find available teachers
                        const avail = levelTeachers.filter(t => {
                            if (!t.subjectIds.includes(sub.id)) return false;
                            if (tSlot[t.id][day].has(p)) return false;
                            if (tSlot[t.id][day].size >= t.maxPeriodsPerDay) return false;
                            if (tWeek[t.id] >= t.maxPeriodsPerWeek) return false;
                            if (constraints.respectUnavailability && t.unavailableSlots.some(s => s.day === day && s.period === p + 1)) return false;
                            return true;
                        });
                        if (avail.length === 0) continue;

                        // ── Score this slot ──
                        let sc = 100;
                        const morning = p < nPeriods / 2;

                        // Preferred time
                        if (constraints.difficultMorning && sub.preferredTime === 'morning') sc += morning ? 20 : -15;
                        if (constraints.activityAfternoon && sub.preferredTime === 'afternoon') sc += morning ? -15 : 20;

                        // Spread subject across days (bonus for unused days)
                        const daysWithSub = days.filter(d => grid[d].some(e => e?.subjectId === sub.id)).length;
                        sc += Math.max(0, (days.length - daysWithSub)) * 6;

                        // Consecutive penalty
                        if (p > 0 && grid[day][p - 1]?.subjectId === sub.id) {
                            let cc = 1; let k = p - 1;
                            while (k >= 0 && grid[day][k]?.subjectId === sub.id) { cc++; k--; }
                            sc += cc >= sub.maxConsecutive ? -80 : -8;
                        }

                        // Prefer filling days evenly
                        const dayFill = grid[day].filter(e => e !== null).length;
                        sc -= dayFill * 3;

                        // Small randomness for variety across attempts
                        sc += Math.random() * 10;

                        if (sc > bestSlotScore) {
                            bestSlotScore = sc;
                            bestDay = day;
                            bestPeriod = p;
                            // Pick teacher with least weekly load
                            bestTeacher = avail.reduce((a, b) => tWeek[a.id] <= tWeek[b.id] ? a : b);
                        }
                    }
                }

                if (bestTeacher && bestPeriod >= 0) {
                    grid[bestDay][bestPeriod] = { subjectId: sub.id, subjectName: sub.name, subjectCode: sub.code, teacherId: bestTeacher.id, teacherName: bestTeacher.name };
                    tSlot[bestTeacher.id][bestDay].add(bestPeriod);
                    tWeek[bestTeacher.id]++;
                    totalScore += bestSlotScore;
                }
            }

            // Phase 3: Local search — swap random pairs to improve quality
            const scoreSlot = (entry: TimetableEntry | null, day: string, p: number): number => {
                if (!entry) return 0;
                const sub = subjects.find(s => s.id === entry.subjectId);
                if (!sub) return 0;
                let sc = 50;
                const morning = p < nPeriods / 2;
                if (sub.preferredTime === 'morning') sc += morning ? 15 : -10;
                if (sub.preferredTime === 'afternoon') sc += morning ? -10 : 15;
                const subInDay = grid[day].filter(e => e?.subjectId === sub.id).length;
                sc -= subInDay * 4;
                return sc;
            };

            for (let sw = 0; sw < 300; sw++) {
                const d1 = days[Math.floor(Math.random() * days.length)];
                const d2 = days[Math.floor(Math.random() * days.length)];
                const p1 = Math.floor(Math.random() * nPeriods);
                const p2 = Math.floor(Math.random() * nPeriods);
                if (d1 === d2 && p1 === p2) continue;

                const e1 = grid[d1][p1];
                const e2 = grid[d2][p2];
                if (!e1 && !e2) continue;

                // Validate swap: check teacher availability at new positions
                const canSwap = () => {
                    if (e1) {
                        const t = teachers.find(t => t.id === e1.teacherId)!;
                        if (tSlot[t.id][d2].has(p2) && !(d1 === d2 && p1 === p2)) return false;
                        if (e2 && e2.teacherId === t.id) { } // same teacher OK
                        else if (tSlot[t.id][d2].size >= t.maxPeriodsPerDay && !tSlot[t.id][d2].has(p2)) return false;
                    }
                    if (e2) {
                        const t = teachers.find(t => t.id === e2.teacherId)!;
                        if (tSlot[t.id][d1].has(p1) && !(d1 === d2 && p1 === p2)) return false;
                        if (e1 && e1.teacherId === t.id) { }
                        else if (tSlot[t.id][d1].size >= t.maxPeriodsPerDay && !tSlot[t.id][d1].has(p1)) return false;
                    }
                    // Check subject-per-day limits
                    if (e1) {
                        const cnt = grid[d2].filter(e => e?.subjectId === e1.subjectId).length + 1 - (e2?.subjectId === e1.subjectId ? 1 : 0);
                        if (cnt > constraints.maxPeriodsPerDayPerSubject) return false;
                    }
                    if (e2) {
                        const cnt = grid[d1].filter(e => e?.subjectId === e2.subjectId).length + 1 - (e1?.subjectId === e2.subjectId ? 1 : 0);
                        if (cnt > constraints.maxPeriodsPerDayPerSubject) return false;
                    }
                    return true;
                };

                if (!canSwap()) continue;

                const oldScore = scoreSlot(e1, d1, p1) + scoreSlot(e2, d2, p2);
                const newScore = scoreSlot(e1, d2, p2) + scoreSlot(e2, d1, p1);

                if (newScore > oldScore) {
                    // Perform swap
                    grid[d1][p1] = e2;
                    grid[d2][p2] = e1;
                    // Update teacher slot tracking
                    if (e1) { tSlot[e1.teacherId][d1].delete(p1); tSlot[e1.teacherId][d2].add(p2); }
                    if (e2) { tSlot[e2.teacherId][d2].delete(p2); tSlot[e2.teacherId][d1].add(p1); }
                    totalScore += (newScore - oldScore);
                }
            }

            // Count violations
            subjects.forEach(s => {
                const placed = days.reduce((a, d) => a + grid[d].filter(e => e?.subjectId === s.id).length, 0);
                if (placed < s.periodsPerWeek) violations.push(`${sec.className} ${sec.sectionName}: ${s.name} got ${placed}/${s.periodsPerWeek} periods`);
            });
            schedules.push({ classId: sec.classId, className: sec.className, sectionId: sec.id, sectionName: sec.sectionName, grid });
        }

        const vCount = violations.length;
        if (best === null || vCount < best.violations.length || (vCount === best.violations.length && totalScore > bestScore)) {
            bestScore = totalScore;
            best = { sections: schedules, score: totalScore, violations, generatedAt: new Date().toISOString() };
        }
    }
    return best!;
}

function getPeriodTime(start: string, periodIdx: number, duration: number, breaks: SchoolTimings['breaks']): string {
    const [h, m] = start.split(':').map(Number);
    let mins = h * 60 + m;
    for (let i = 0; i < periodIdx; i++) {
        mins += duration;
        const br = breaks.find(b => b.afterPeriod === i + 1);
        if (br) mins += br.duration;
    }
    const sh = Math.floor(mins / 60), sm = mins % 60;
    const eh = Math.floor((mins + duration) / 60), em = (mins + duration) % 60;
    return `${sh % 12 || 12}:${String(sm).padStart(2, '0')}–${eh % 12 || 12}:${String(em).padStart(2, '0')}`;
}

// ===== COMPONENT =====
const TimetableGenerator: React.FC<Props> = ({ isDarkMode }) => {
    const [step, setStep] = useState(1);
    const [classes, setClasses] = useState<TimetableClass[]>(DEF_CLASSES);
    const [subjects] = useState<TimetableSubject[]>(DEF_SUBJECTS);
    const [teachers, setTeachers] = useState<TimetableTeacher[]>(DEF_TEACHERS);
    const [levelFilter, setLevelFilter] = useState<number>(0);
    const [timings] = useState<SchoolTimings>(DEF_TIMINGS);
    const [constraints] = useState<ConstraintSettings>(DEF_CONSTRAINTS);
    const [timetable, setTimetable] = useState<GeneratedTimetable | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selSection, setSelSection] = useState(0);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const result = solveTimetable(classes, subjects, teachers, timings, constraints);
            setTimetable(result);
            setIsGenerating(false);
        }, 2500);
    };

    const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm';
    const heading = 'text-xl font-black text-slate-800 dark:text-slate-100';
    const sub = 'text-sm text-slate-500 dark:text-slate-400';
    const inp = 'border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 w-full';

    // ===== STEP 1: CLASSES =====
    const renderClasses = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div><h3 className={heading}>Classes & Sections</h3><p className={sub}>Configure your school's class structure</p></div>
                <button onClick={() => { const id = `c${Date.now()}`; const nextNum = classes.length + 1; setClasses([...classes, { id, name: `Class ${nextNum}`, sections: [{ id: `${id}A`, name: 'A', studentCount: 40, roomNumber: '' }] }]); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95">
                    <Plus size={16} /> Add Class
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls, ci) => (
                    <div key={cls.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                        <div className="flex justify-between items-center">
                            <input value={cls.name} onChange={e => { const c = [...classes]; c[ci] = { ...c[ci], name: e.target.value }; setClasses(c); }} className="text-lg font-black text-slate-800 dark:text-slate-100 bg-transparent outline-none border-b border-transparent focus:border-indigo-500 w-40" />
                            <button onClick={() => setClasses(classes.filter((_, i) => i !== ci))} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                        </div>
                        {cls.sections.map((sec, si) => (
                            <div key={sec.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black text-xs">{sec.name}</span>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <input type="number" value={sec.studentCount} onChange={e => { const c = [...classes]; c[ci].sections[si] = { ...sec, studentCount: +e.target.value }; setClasses(c); }}
                                        className="text-xs font-bold bg-slate-50 dark:bg-slate-700 rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-600 outline-none w-full" placeholder="Students" />
                                    <input value={sec.roomNumber} onChange={e => { const c = [...classes]; c[ci].sections[si] = { ...sec, roomNumber: e.target.value }; setClasses(c); }}
                                        className="text-xs font-bold bg-slate-50 dark:bg-slate-700 rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-600 outline-none w-full" placeholder="Room" />
                                </div>
                                <button onClick={() => { const c = [...classes]; c[ci].sections = c[ci].sections.filter((_, j) => j !== si); setClasses(c); }} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        <button onClick={() => { const c = [...classes]; const l = String.fromCharCode(65 + c[ci].sections.length); c[ci].sections.push({ id: `${cls.id}${l}`, name: l, studentCount: 40, roomNumber: '' }); setClasses(c); }}
                            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"><Plus size={12} />Add Section</button>
                    </div>
                ))}
            </div>
        </div>
    );

    // ===== STEP 2: SUBJECTS =====
    const renderSubjects = () => (
        <div className="space-y-4">
            <div><h3 className={heading}>Subject Configuration</h3><p className={sub}>Subjects are pre-configured for your school. Review and adjust as needed.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subjects.map(s => {
                    const col = SC[s.id] || DC;
                    return (
                        <div key={s.id} className="flex items-center gap-4 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition-all" style={{ backgroundColor: isDarkMode ? col.dk + '33' : col.bg + '66' }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm" style={{ backgroundColor: isDarkMode ? col.dk : col.bg, color: isDarkMode ? col.dtx : col.tx }}>{s.code}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-800 dark:text-slate-100 text-sm">{s.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${TYPE_BADGES[s.type]}`}>{s.type}</span>
                                </div>
                                <div className="flex gap-3 mt-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                    <span>{s.periodsPerWeek} per/wk</span>
                                    <span>•</span>
                                    <span>{s.preferredTime}</span>
                                    {s.requiresLab && <><span>•</span><span className="text-purple-500">Lab</span></>}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black" style={{ color: isDarkMode ? col.dtx : col.tx }}>{s.periodsPerWeek}</div>
                                <div className="text-[10px] text-slate-400 font-bold">PER WEEK</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-2">
                <Sparkles size={16} /> Total: {subjects.reduce((a, s) => a + s.periodsPerWeek, 0)} periods/week per section • {timings.periodsPerDay * timings.workingDays.length} slots available
            </div>
        </div>
    );

    // ===== STEP 3: TEACHERS =====
    const addTeacher = (level: 1 | 2 | 3 | 4) => {
        const id = `T${Date.now()}`;
        setTeachers([...teachers, { id, name: 'New Teacher', subjectIds: ['math'], level, maxPeriodsPerDay: 6, maxPeriodsPerWeek: 30, unavailableSlots: [], maxConsecutive: 3 }]);
    };
    const removeTeacher = (id: string) => setTeachers(teachers.filter(t => t.id !== id));

    const renderTeachers = () => {
        const filtered = levelFilter === 0 ? teachers : teachers.filter(t => t.level === levelFilter);
        return (
            <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <div><h3 className={heading}>Teaching Staff ({teachers.length} Faculty)</h3><p className={sub}>Faculty organized by grade level with badges</p></div>
                    <button onClick={() => addTeacher((levelFilter || 1) as 1 | 2 | 3 | 4)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95"><Plus size={16} /> Add Teacher</button>
                </div>
                {/* Level Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setLevelFilter(0)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${levelFilter === 0 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>All ({teachers.length})</button>
                    {[1, 2, 3, 4].map(lv => {
                        const info = LEVEL_INFO[lv]; const count = teachers.filter(t => t.level === lv).length; return (
                            <button key={lv} onClick={() => setLevelFilter(lv)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${levelFilter === lv ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${info.bg} ${info.color}`}>{info.badge}</span> {info.name} ({count})
                            </button>
                        );
                    })}
                </div>
                {/* Level Legend */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(lv => {
                        const info = LEVEL_INFO[lv]; return (
                            <div key={lv} className={`rounded-xl p-3 border border-slate-200 dark:border-slate-700 ${info.bg} flex items-center gap-2`}>
                                <span className={`font-black text-sm ${info.color}`}>{info.badge}</span>
                                <div><p className={`text-xs font-bold ${info.color}`}>{info.name}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">{info.classes}</p></div>
                            </div>
                        );
                    })}
                </div>
                {/* Teacher Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map(t => {
                        const lvInfo = LEVEL_INFO[t.level]; return (
                            <div key={t.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-all relative group">
                                <button onClick={() => removeTeacher(t.id)} className="absolute top-3 right-3 text-slate-300 dark:text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-sm">{t.name.split(' ').pop()?.[0]}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-slate-800 dark:text-slate-100 text-sm truncate">{t.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${lvInfo.bg} ${lvInfo.color}`}>{lvInfo.badge}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{lvInfo.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {t.subjectIds.map(sid => {
                                        const s = subjects.find(x => x.id === sid); const col = SC[sid] || DC;
                                        return <span key={sid} className="text-[10px] px-2 py-1 rounded-lg font-bold" style={{ backgroundColor: isDarkMode ? col.dk : col.bg, color: isDarkMode ? col.dtx : col.tx }}>{s?.name || sid}</span>;
                                    })}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                    <span>Day: <span className="text-slate-800 dark:text-slate-200">{t.maxPeriodsPerDay}</span></span>
                                    <span>Week: <span className="text-slate-800 dark:text-slate-200">{t.maxPeriodsPerWeek}</span></span>
                                    <span className={`${lvInfo.color}`}>{lvInfo.classes}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ===== STEP 4: TIMINGS =====
    const renderTimings = () => (
        <div className="space-y-6">
            <div><h3 className={heading}>School Timings</h3><p className={sub}>Configure your daily schedule structure</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Start Time', value: timings.startTime, icon: '🌅' },
                    { label: 'End Time', value: timings.endTime, icon: '🌆' },
                    { label: 'Periods/Day', value: String(timings.periodsPerDay), icon: '📋' },
                    { label: 'Period Duration', value: `${timings.periodDuration} min`, icon: '⏱️' },
                ].map(item => (
                    <div key={item.label} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{item.value}</div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</div>
                    </div>
                ))}
            </div>
            <div>
                <h4 className="text-base font-black text-slate-800 dark:text-slate-100 mb-3">Working Days</h4>
                <div className="flex flex-wrap gap-2">
                    {timings.workingDays.map(d => (
                        <span key={d} className="px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold text-sm">{d}</span>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="text-base font-black text-slate-800 dark:text-slate-100 mb-3">Breaks</h4>
                <div className="space-y-2">
                    {timings.breaks.map((b, i) => (
                        <div key={i} className="flex items-center gap-4 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/30">
                            <span className="text-lg">☕</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm flex-1">{b.name}</span>
                            <span className="text-xs text-slate-500 font-bold">After Period {b.afterPeriod}</span>
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full font-bold">{b.duration} min</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // ===== STEP 5: CONSTRAINTS =====
    const renderConstraints = () => {
        const Toggle = ({ on, label, desc }: { on: boolean; label: string; desc: string }) => (
            <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div><p className="font-bold text-sm text-slate-800 dark:text-slate-100">{label}</p><p className="text-[11px] text-slate-400 mt-0.5">{desc}</p></div>
                <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${on ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </div>
        );
        return (
            <div className="space-y-6">
                <div><h3 className={heading}>Constraint Rules</h3><p className={sub}>Hard constraints are mandatory. Soft constraints guide optimization.</p></div>
                <div>
                    <h4 className="text-sm font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck size={16} /> Hard Constraints</h4>
                    <div className="space-y-2">
                        <Toggle on={true} label="No Teacher Clash" desc="A teacher cannot be in two places at once" />
                        <Toggle on={true} label="Exact Period Counts" desc="Each subject gets exactly the specified periods per week" />
                        <Toggle on={constraints.respectUnavailability} label="Teacher Unavailability" desc="Respect teacher's unavailable time slots" />
                        <Toggle on={constraints.labConsecutive} label="Lab Consecutive Periods" desc="Lab subjects get back-to-back slots" />
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles size={16} /> Soft Constraints</h4>
                    <div className="space-y-2">
                        <Toggle on={constraints.difficultMorning} label="Difficult Subjects in Morning" desc="Math, Science scheduled in Period 1-4" />
                        <Toggle on={constraints.activityAfternoon} label="Activities in Afternoon" desc="PE, Art, Music scheduled in later periods" />
                        <Toggle on={constraints.balancedLoad} label="Balanced Daily Load" desc="Distribute subjects evenly across the week" />
                        <Toggle on={constraints.minimizeGaps} label="Minimize Teacher Gaps" desc="Reduce idle periods for teachers" />
                    </div>
                </div>
            </div>
        );
    };

    // ===== STEP 6: GENERATE =====
    const renderGenerate = () => {
        if (isGenerating) {
            return (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 animate-spin" />
                        <Wand2 size={32} className="text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">AI is generating your timetable...</h3>
                        <p className="text-sm text-slate-500 mt-2">Running AI constraint solver with 80 restarts + local search optimization</p>
                    </div>
                    <div className="w-64 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                </div>
            );
        }

        if (timetable) {
            const sec = timetable.sections[selSection];
            const days = timings.workingDays;
            return (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className={heading}>Generated Timetable ✨</h3>
                            <p className={sub}>Score: {Math.round(timetable.score)} • Generated at {new Date(timetable.generatedAt).toLocaleTimeString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setTimetable(null); handleGenerate(); }} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"><RotateCcw size={14} />Regenerate</button>
                            <button onClick={() => window.print()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"><Printer size={14} />Print</button>
                        </div>
                    </div>

                    {timetable.violations.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300 font-bold flex items-start gap-2">
                            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                            <div>{timetable.violations.length} warning(s): {timetable.violations.slice(0, 3).join('; ')}</div>
                        </div>
                    )}

                    {/* Section Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {timetable.sections.map((s, i) => (
                            <button key={s.sectionId} onClick={() => setSelSection(i)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${i === selSection ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                {s.className} - {s.sectionName}
                            </button>
                        ))}
                    </div>

                    {/* Timetable Grid */}
                    {sec && (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                            <table className="w-full border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-100 dark:bg-slate-800">
                                        <th className="p-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 w-20">Period</th>
                                        {days.map(d => (
                                            <th key={d} className="p-3 text-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">{d.slice(0, 3)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: timings.periodsPerDay }).map((_, pi) => {
                                        const brk = timings.breaks.find(b => b.afterPeriod === pi);
                                        return (
                                            <React.Fragment key={pi}>
                                                {brk && (
                                                    <tr><td colSpan={days.length + 1} className="bg-amber-50 dark:bg-amber-900/10 text-center py-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-700">☕ {brk.name} ({brk.duration} min)</td></tr>
                                                )}
                                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-2 border-b border-slate-100 dark:border-slate-800">
                                                        <div className="text-center">
                                                            <div className="font-black text-slate-700 dark:text-slate-200 text-sm">P{pi + 1}</div>
                                                            <div className="text-[9px] text-slate-400 font-bold">{getPeriodTime(timings.startTime, pi, timings.periodDuration, timings.breaks)}</div>
                                                        </div>
                                                    </td>
                                                    {days.map(d => {
                                                        const entry = sec.grid[d]?.[pi];
                                                        if (!entry) return <td key={d} className="p-1.5 border-b border-slate-100 dark:border-slate-800"><div className="rounded-xl p-2 text-center bg-slate-50 dark:bg-slate-800/50 h-14 flex items-center justify-center text-[10px] text-slate-300 dark:text-slate-600 font-bold">FREE</div></td>;
                                                        const col = SC[entry.subjectId] || DC;
                                                        return (
                                                            <td key={d} className="p-1.5 border-b border-slate-100 dark:border-slate-800">
                                                                <div className="rounded-xl p-2 text-center h-14 flex flex-col items-center justify-center transition-transform hover:scale-105"
                                                                    style={{ backgroundColor: isDarkMode ? col.dk : col.bg }}>
                                                                    <div className="font-black text-xs" style={{ color: isDarkMode ? col.dtx : col.tx }}>{entry.subjectCode}</div>
                                                                    <div className="text-[9px] font-bold mt-0.5 opacity-70" style={{ color: isDarkMode ? col.dtx : col.tx }}>{entry.teacherName.split(' ').pop()}</div>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            );
        }

        // Pre-generate summary
        const totalSections = classes.reduce((a, c) => a + c.sections.length, 0);
        return (
            <div className="space-y-6">
                <div className="text-center py-8 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                        <Wand2 size={36} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Ready to Generate!</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">The AI will analyze your configuration and create an optimized weekly timetable for all {totalSections} sections.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {[
                        { label: 'Classes', value: classes.length, color: 'text-blue-600' },
                        { label: 'Sections', value: totalSections, color: 'text-purple-600' },
                        { label: 'Subjects', value: subjects.length, color: 'text-emerald-600' },
                        { label: 'Teachers', value: teachers.length, color: 'text-amber-600' },
                    ].map(s => (
                        <div key={s.label} className="text-center border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
                <div className="text-center">
                    <button onClick={handleGenerate}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all active:scale-95 flex items-center gap-3 mx-auto">
                        <Sparkles size={22} /> Generate Timetable
                    </button>
                </div>
            </div>
        );
    };

    const renderStep = () => {
        switch (step) {
            case 1: return renderClasses();
            case 2: return renderSubjects();
            case 3: return renderTeachers();
            case 4: return renderTimings();
            case 5: return renderConstraints();
            case 6: return renderGenerate();
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={`${card} p-6 md:p-8`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Calendar size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">AI Timetable</h2>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Intelligent Schedule Generator</p>
                        </div>
                    </div>
                    <Sparkles size={20} className="text-indigo-400 animate-pulse" />
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-0">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s.id}>
                            {i > 0 && <div className={`h-0.5 w-6 md:w-12 transition-colors ${step >= s.id ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                            <button onClick={() => { if (s.id <= step || s.id === step + 1) setStep(s.id); }}
                                className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${step === s.id ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50 scale-110' :
                                    step > s.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    }`}>
                                {step > s.id ? <Check size={14} /> : s.id}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
                <div className="hidden md:flex justify-center gap-0 mt-2">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s.id}>
                            {i > 0 && <div className="w-12" />}
                            <div className={`w-10 text-center text-[9px] font-bold uppercase tracking-wider ${step === s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{s.title}</div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className={`${card} p-6 md:p-8`}>
                {renderStep()}
            </div>

            {/* Navigation */}
            {!(step === 6 && (isGenerating || timetable)) && (
                <div className="flex justify-between">
                    <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${step === 1 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95'}`}>
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <button onClick={() => setStep(Math.min(6, step + 1))} disabled={step === 6}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${step === 6 ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95'}`}>
                        {step === 5 ? 'Generate' : 'Next'} <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default TimetableGenerator;
