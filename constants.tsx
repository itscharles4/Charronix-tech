
import { Student, Teacher, Notice } from './types';

export const MOCK_STUDENTS: Student[] = [
  { 
    id: '1', 
    admissionNo: 'ADM2024001', 
    firstName: 'Aarav', 
    lastName: 'Sharma', 
    class: '10', 
    section: 'A', 
    rollNo: 1, 
    parentName: 'Rajesh Sharma', 
    parentPhone: '9876543210', 
    status: 'ACTIVE',
    overallAttendance: 94,
    medicalInfo: {
      bloodGroup: 'B+',
      allergies: ['Peanuts'],
      chronicConditions: ['None'],
      lastCheckup: '2025-11-15'
    },
    achievements: [
      { id: 'a1', title: '1st Place In Inter-School Debate', date: '2025-09-12', category: 'Academic' },
      { id: 'a2', title: 'District Level Cricket Runner-up', date: '2025-10-05', category: 'Sports' }
    ],
    communicationLogs: [
      { id: 'l1', date: '2026-01-10', type: 'Call', note: 'Discussed improvement in Mathematics performance.', author: 'Meera Iyer' },
      { id: 'l2', date: '2025-12-15', type: 'SMS', note: 'Absence notification sent to parent.', author: 'System' }
    ],
    academicGrades: [
      { subject: 'Mathematics', score: 85, maxScore: 100, grade: 'A' },
      { subject: 'Physics', score: 92, maxScore: 100, grade: 'A+' },
      { subject: 'English', score: 78, maxScore: 100, grade: 'B+' },
      { subject: 'History', score: 88, maxScore: 100, grade: 'A' },
      { subject: 'Chemistry', score: 81, maxScore: 100, grade: 'A' }
    ]
  },
  { 
    id: '2', 
    admissionNo: 'ADM2024002', 
    firstName: 'Ishani', 
    lastName: 'Verma', 
    class: '10', 
    section: 'A', 
    rollNo: 2, 
    parentName: 'Amit Verma', 
    parentPhone: '9876543211', 
    status: 'ACTIVE',
    overallAttendance: 98,
    academicGrades: [
      { subject: 'Mathematics', score: 95, maxScore: 100, grade: 'A+' },
      { subject: 'Physics', score: 98, maxScore: 100, grade: 'O' }
    ]
  },
  { id: '3', admissionNo: 'ADM2024003', firstName: 'Vihaan', lastName: 'Gupta', class: '10', section: 'A', rollNo: 3, parentName: 'Sanjay Gupta', parentPhone: '9876543212', status: 'ACTIVE', overallAttendance: 88 },
  { id: '4', admissionNo: 'ADM2024004', firstName: 'Ananya', lastName: 'Singh', class: '10', section: 'A', rollNo: 4, parentName: 'Karan Singh', parentPhone: '9876543213', status: 'ACTIVE', overallAttendance: 91 },
  { id: '5', admissionNo: 'ADM2024005', firstName: 'Arjun', lastName: 'Patel', class: '10', section: 'A', rollNo: 5, parentName: 'Sunil Patel', parentPhone: '9876543214', status: 'ACTIVE', overallAttendance: 95 },
];

export const MOCK_TEACHERS: Teacher[] = [
  { id: 't1', employeeId: 'TCH001', firstName: 'Meera', lastName: 'Iyer', phone: '9000000001', subjects: ['Mathematics', 'Physics'], assignedClasses: ['10-A', '10-B'] },
  { id: 't2', employeeId: 'TCH002', firstName: 'Rahul', lastName: 'Kapoor', phone: '9000000002', subjects: ['English', 'History'], assignedClasses: ['9-A', '9-C'] },
];

export const MOCK_NOTICES: Notice[] = [
  // Fixed: Added 'type' property to meet 'Notice' interface requirement
  { id: 'n1', title: 'Republic Day Celebration', message: 'All students are requested to be present in school uniform for the flag hoisting at 8:00 AM.', target: 'All', date: '2026-01-24', author: 'Principal', smsSent: true, type: 'EVENT' },
  // Fixed: Added 'type' property to meet 'Notice' interface requirement
  { id: 'n2', title: 'Parent-Teacher Meeting', message: 'PTM for Class 10 scheduled for Saturday. Kindly check the time slots assigned.', target: 'Class 10', date: '2026-01-20', author: 'Class Teacher', smsSent: false, type: 'GENERAL' },
];

export const COLORS = {
  PRESENT: '#22c55e',
  ABSENT: '#ef4444',
  LATE: '#eab308',
  LEAVE: '#3b82f6',
};