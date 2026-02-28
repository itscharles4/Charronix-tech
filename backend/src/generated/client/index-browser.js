
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  role: 'role',
  isActive: 'isActive',
  lastLoginAt: 'lastLoginAt',
  loginAttempts: 'loginAttempts',
  lockedUntil: 'lockedUntil',
  twoFactorEnabled: 'twoFactorEnabled',
  twoFactorSecret: 'twoFactorSecret',
  profilePhotoUrl: 'profilePhotoUrl',
  preferences: 'preferences',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  loginId: 'loginId'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  admissionNo: 'admissionNo',
  firstName: 'firstName',
  lastName: 'lastName',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  class: 'class',
  section: 'section',
  rollNo: 'rollNo',
  parentName: 'parentName',
  parentPhone: 'parentPhone',
  parentEmail: 'parentEmail',
  status: 'status',
  bloodGroup: 'bloodGroup',
  photoUrl: 'photoUrl',
  address: 'address',
  totalPresent: 'totalPresent',
  totalAbsent: 'totalAbsent',
  attendancePercentage: 'attendancePercentage',
  lastAttendanceDate: 'lastAttendanceDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeacherScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  employeeId: 'employeeId',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  email: 'email',
  qualification: 'qualification',
  dateOfJoining: 'dateOfJoining',
  isClassTeacherOf: 'isClassTeacherOf',
  photoUrl: 'photoUrl',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeacherSubjectScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  subject: 'subject'
};

exports.Prisma.TeacherClassScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  classSection: 'classSection'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  date: 'date',
  status: 'status',
  markedById: 'markedById',
  remarks: 'remarks',
  location: 'location',
  smsNotificationSent: 'smsNotificationSent',
  smsDeliveryStatus: 'smsDeliveryStatus',
  createdAt: 'createdAt'
};

exports.Prisma.AcademicGradeScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  subject: 'subject',
  score: 'score',
  maxScore: 'maxScore',
  grade: 'grade',
  term: 'term',
  academicYear: 'academicYear',
  enteredById: 'enteredById',
  createdAt: 'createdAt'
};

exports.Prisma.AchievementScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  title: 'title',
  date: 'date',
  category: 'category',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.ComplaintScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  teacherId: 'teacherId',
  description: 'description',
  date: 'date',
  severity: 'severity',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.MedicalInfoScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  bloodGroup: 'bloodGroup',
  allergies: 'allergies',
  chronicConditions: 'chronicConditions',
  lastCheckup: 'lastCheckup',
  emergencyContact: 'emergencyContact',
  notes: 'notes',
  updatedAt: 'updatedAt'
};

exports.Prisma.CommunicationLogScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  date: 'date',
  type: 'type',
  note: 'note',
  author: 'author',
  createdAt: 'createdAt'
};

exports.Prisma.NoticeScalarFieldEnum = {
  id: 'id',
  title: 'title',
  message: 'message',
  target: 'target',
  date: 'date',
  author: 'author',
  smsSent: 'smsSent',
  type: 'type',
  priority: 'priority',
  expiresAt: 'expiresAt',
  attachmentUrl: 'attachmentUrl',
  readBy: 'readBy',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.TimetableClassScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.TimetableSectionScalarFieldEnum = {
  id: 'id',
  classId: 'classId',
  name: 'name',
  studentCount: 'studentCount',
  roomNumber: 'roomNumber'
};

exports.Prisma.TimetableSubjectScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  type: 'type',
  periodsPerWeek: 'periodsPerWeek',
  requiresLab: 'requiresLab',
  maxConsecutive: 'maxConsecutive',
  preferredTime: 'preferredTime'
};

exports.Prisma.TimetableTeacherScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  name: 'name',
  level: 'level',
  maxPeriodsPerDay: 'maxPeriodsPerDay',
  maxPeriodsPerWeek: 'maxPeriodsPerWeek',
  maxConsecutive: 'maxConsecutive'
};

exports.Prisma.TimetableTeacherSubjectScalarFieldEnum = {
  id: 'id',
  ttTeacherId: 'ttTeacherId',
  ttSubjectId: 'ttSubjectId'
};

exports.Prisma.TimetableUnavailableSlotScalarFieldEnum = {
  id: 'id',
  ttTeacherId: 'ttTeacherId',
  day: 'day',
  period: 'period'
};

exports.Prisma.SchoolTimingScalarFieldEnum = {
  id: 'id',
  startTime: 'startTime',
  endTime: 'endTime',
  periodsPerDay: 'periodsPerDay',
  periodDuration: 'periodDuration',
  isActive: 'isActive'
};

exports.Prisma.SchoolWorkingDayScalarFieldEnum = {
  id: 'id',
  timingId: 'timingId',
  dayName: 'dayName'
};

exports.Prisma.SchoolBreakScalarFieldEnum = {
  id: 'id',
  timingId: 'timingId',
  name: 'name',
  afterPeriod: 'afterPeriod',
  duration: 'duration'
};

exports.Prisma.GeneratedTimetableScalarFieldEnum = {
  id: 'id',
  score: 'score',
  violations: 'violations',
  generatedAt: 'generatedAt',
  isActive: 'isActive',
  constraintSettings: 'constraintSettings'
};

exports.Prisma.TimetableEntryScalarFieldEnum = {
  id: 'id',
  timetableId: 'timetableId',
  classId: 'classId',
  sectionId: 'sectionId',
  day: 'day',
  period: 'period',
  subjectId: 'subjectId',
  teacherId: 'teacherId'
};

exports.Prisma.AiChatHistoryScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  role: 'role',
  message: 'message',
  createdAt: 'createdAt'
};

exports.Prisma.PasswordResetTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  expiresAt: 'expiresAt',
  used: 'used',
  createdAt: 'createdAt'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  expiresAt: 'expiresAt',
  isRevoked: 'isRevoked',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  details: 'details',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  device: 'device',
  ipAddress: 'ipAddress',
  lastActivity: 'lastActivity',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.FileUploadScalarFieldEnum = {
  id: 'id',
  fileName: 'fileName',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  fileSize: 'fileSize',
  uploadedBy: 'uploadedBy',
  entityType: 'entityType',
  entityId: 'entityId',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  message: 'message',
  type: 'type',
  category: 'category',
  priority: 'priority',
  isRead: 'isRead',
  readAt: 'readAt',
  actionUrl: 'actionUrl',
  iconEmoji: 'iconEmoji',
  senderUserId: 'senderUserId',
  senderName: 'senderName',
  senderRole: 'senderRole',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemSettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  category: 'category',
  updatedBy: 'updatedBy',
  updatedAt: 'updatedAt'
};

exports.Prisma.TimetableScalarFieldEnum = {
  id: 'id',
  class: 'class',
  section: 'section',
  dayOfWeek: 'dayOfWeek',
  period: 'period',
  periodTime: 'periodTime',
  subject: 'subject',
  teacherName: 'teacherName',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeeStructureScalarFieldEnum = {
  id: 'id',
  schoolId: 'schoolId',
  feeType: 'feeType',
  class: 'class',
  academicYear: 'academicYear',
  amount: 'amount',
  dueDate: 'dueDate',
  lateFee: 'lateFee',
  discount: 'discount',
  description: 'description',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeeRecordScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  feeStructureId: 'feeStructureId',
  feeType: 'feeType',
  academicYear: 'academicYear',
  totalAmount: 'totalAmount',
  paidAmount: 'paidAmount',
  remainingAmount: 'remainingAmount',
  dueDate: 'dueDate',
  status: 'status',
  isPaid: 'isPaid',
  isOverdue: 'isOverdue',
  lateFeeApplied: 'lateFeeApplied',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  feeRecordId: 'feeRecordId',
  studentId: 'studentId',
  parentUserId: 'parentUserId',
  amount: 'amount',
  paymentMethod: 'paymentMethod',
  transactionId: 'transactionId',
  receiptNumber: 'receiptNumber',
  gatewayOrderId: 'gatewayOrderId',
  gatewayPaymentId: 'gatewayPaymentId',
  gatewaySignature: 'gatewaySignature',
  gatewayResponse: 'gatewayResponse',
  status: 'status',
  paidAt: 'paidAt',
  remarks: 'remarks',
  receiptUrl: 'receiptUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssignmentScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  title: 'title',
  description: 'description',
  subject: 'subject',
  class: 'class',
  section: 'section',
  attachmentUrl: 'attachmentUrl',
  attachmentName: 'attachmentName',
  attachmentSize: 'attachmentSize',
  dueDate: 'dueDate',
  allowLateSubmission: 'allowLateSubmission',
  maxMarks: 'maxMarks',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubmissionScalarFieldEnum = {
  id: 'id',
  assignmentId: 'assignmentId',
  studentId: 'studentId',
  attachmentUrl: 'attachmentUrl',
  attachmentName: 'attachmentName',
  attachmentSize: 'attachmentSize',
  status: 'status',
  isLate: 'isLate',
  submittedAt: 'submittedAt',
  marksObtained: 'marksObtained',
  feedback: 'feedback',
  gradedAt: 'gradedAt',
  gradedBy: 'gradedBy',
  remarks: 'remarks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  ADMIN: 'ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT'
};

exports.StudentStatus = exports.$Enums.StudentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.AttendanceStatus = exports.$Enums.AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  LEAVE: 'LEAVE'
};

exports.ComplaintSeverity = exports.$Enums.ComplaintSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

exports.ComplaintStatus = exports.$Enums.ComplaintStatus = {
  OPEN: 'OPEN',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED'
};

exports.CommunicationType = exports.$Enums.CommunicationType = {
  SMS: 'SMS',
  Call: 'Call',
  Meeting: 'Meeting',
  Portal: 'Portal'
};

exports.NoticeType = exports.$Enums.NoticeType = {
  GENERAL: 'GENERAL',
  EVENT: 'EVENT',
  EXAM: 'EXAM'
};

exports.NoticePriority = exports.$Enums.NoticePriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.SubjectType = exports.$Enums.SubjectType = {
  core: 'core',
  elective: 'elective',
  activity: 'activity',
  language: 'language'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  SYSTEM: 'SYSTEM'
};

exports.NotificationCategory = exports.$Enums.NotificationCategory = {
  ACADEMIC: 'ACADEMIC',
  EVENT: 'EVENT',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  ATTENDANCE: 'ATTENDANCE',
  EXAM: 'EXAM',
  FEE: 'FEE',
  COMPLAINT: 'COMPLAINT',
  GENERAL: 'GENERAL'
};

exports.NotificationPriority = exports.$Enums.NotificationPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.SettingCategory = exports.$Enums.SettingCategory = {
  SCHOOL: 'SCHOOL',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  AI: 'AI'
};

exports.FeeType = exports.$Enums.FeeType = {
  ACADEMIC: 'ACADEMIC',
  TRANSPORT: 'TRANSPORT',
  HOSTEL: 'HOSTEL',
  REGISTRATION: 'REGISTRATION',
  LIBRARY: 'LIBRARY',
  EXAM: 'EXAM',
  MISCELLANEOUS: 'MISCELLANEOUS'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  RAZORPAY: 'RAZORPAY',
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL',
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER'
};

exports.AssignmentStatus = exports.$Enums.AssignmentStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  DRAFT: 'DRAFT'
};

exports.SubmissionStatus = exports.$Enums.SubmissionStatus = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
  LATE: 'LATE'
};

exports.Prisma.ModelName = {
  User: 'User',
  Student: 'Student',
  Teacher: 'Teacher',
  TeacherSubject: 'TeacherSubject',
  TeacherClass: 'TeacherClass',
  Attendance: 'Attendance',
  AcademicGrade: 'AcademicGrade',
  Achievement: 'Achievement',
  Complaint: 'Complaint',
  MedicalInfo: 'MedicalInfo',
  CommunicationLog: 'CommunicationLog',
  Notice: 'Notice',
  TimetableClass: 'TimetableClass',
  TimetableSection: 'TimetableSection',
  TimetableSubject: 'TimetableSubject',
  TimetableTeacher: 'TimetableTeacher',
  TimetableTeacherSubject: 'TimetableTeacherSubject',
  TimetableUnavailableSlot: 'TimetableUnavailableSlot',
  SchoolTiming: 'SchoolTiming',
  SchoolWorkingDay: 'SchoolWorkingDay',
  SchoolBreak: 'SchoolBreak',
  GeneratedTimetable: 'GeneratedTimetable',
  TimetableEntry: 'TimetableEntry',
  AiChatHistory: 'AiChatHistory',
  PasswordResetToken: 'PasswordResetToken',
  RefreshToken: 'RefreshToken',
  AuditLog: 'AuditLog',
  Session: 'Session',
  FileUpload: 'FileUpload',
  Notification: 'Notification',
  SystemSetting: 'SystemSetting',
  Timetable: 'Timetable',
  FeeStructure: 'FeeStructure',
  FeeRecord: 'FeeRecord',
  Payment: 'Payment',
  Assignment: 'Assignment',
  Submission: 'Submission'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
