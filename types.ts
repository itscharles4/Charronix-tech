
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  PRINCIPAL = 'PRINCIPAL',
  STUDENT = 'STUDENT'
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

export interface SubjectMark {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  term: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  description: string;
  date: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Grade {
  subject: string;
  score: number;
  maxScore: number;
  grade: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  category: string;
}

export interface CommunicationLog {
  id: string;
  date: string;
  type: 'SMS' | 'Call' | 'Meeting' | 'Portal';
  note: string;
  author: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  rollNo: number;
  parentName: string;
  parentPhone: string;
  status: 'ACTIVE' | 'INACTIVE';
  medicalInfo?: {
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    lastCheckup: string;
  };
  achievements?: Achievement[];
  communicationLogs?: CommunicationLog[];
  academicGrades?: Grade[];
  overallAttendance?: number;
  complaints?: Complaint[];
}

export interface Teacher {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phone: string;
  subjects: string[];
  assignedClasses: string[];
  isClassTeacherOf?: string; // e.g. "10-A"
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  target: string;
  date: string;
  author: string;
  smsSent: boolean;
  type: 'GENERAL' | 'EVENT' | 'EXAM';
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: AttendanceStatus;
}

// ===== TIMETABLE TYPES =====

export interface TimetableSection {
  id: string;
  name: string;
  studentCount: number;
  roomNumber: string;
}

export interface TimetableClass {
  id: string;
  name: string;
  sections: TimetableSection[];
}

export interface TimetableSubject {
  id: string;
  name: string;
  code: string;
  type: 'core' | 'elective' | 'activity' | 'language';
  periodsPerWeek: number;
  requiresLab: boolean;
  maxConsecutive: number;
  preferredTime: 'morning' | 'afternoon' | 'any';
}

export interface TimetableTeacher {
  id: string;
  name: string;
  subjectIds: string[];
  level: 1 | 2 | 3 | 4;
  maxPeriodsPerDay: number;
  maxPeriodsPerWeek: number;
  unavailableSlots: { day: string; period: number }[];
  maxConsecutive: number;
}

export interface SchoolTimings {
  startTime: string;
  endTime: string;
  workingDays: string[];
  periodsPerDay: number;
  periodDuration: number;
  breaks: { name: string; afterPeriod: number; duration: number }[];
}

export interface ConstraintSettings {
  respectUnavailability: boolean;
  labConsecutive: boolean;
  maxPeriodsPerDayPerSubject: number;
  difficultMorning: boolean;
  activityAfternoon: boolean;
  balancedLoad: boolean;
  minimizeGaps: boolean;
  maxConsecutiveSame: number;
}

export interface TimetableEntry {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
}

export interface SectionSchedule {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  grid: Record<string, (TimetableEntry | null)[]>;
}

export interface GeneratedTimetable {
  sections: SectionSchedule[];
  score: number;
  violations: string[];
  generatedAt: string;
}
