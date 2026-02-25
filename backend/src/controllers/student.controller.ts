import { Request, Response, NextFunction } from 'express';
import studentService from '../services/student.service';
import attendanceService from '../services/attendance.service';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import prisma from '../config/database';

export class StudentController {
    async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }
            const student = await studentService.getMe(req.user.userId);
            sendSuccess(res, student, 'Profile retrieved successfully');
        } catch (err) { next(err); }
    }

    async getMyAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            // Get student ID from user
            const student = await prisma.student.findUnique({
                where: { userId: req.user.userId },
            });

            if (!student) {
                res.status(404).json({ success: false, message: 'Student profile not found' });
                return;
            }

            // Get attendance for requested month/year or current month
            let year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
            let month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;

            // Get all attendance records for the student
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const attendanceRecords = await prisma.attendance.findMany({
                where: {
                    studentId: student.id,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: 'asc' },
            });
            
            // Calculate statistics
            const totalDays = attendanceRecords.length;
            const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
            const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length;
            const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length;
            const leaveCount = attendanceRecords.filter(r => r.status === 'LEAVE').length;
            const attendancePercentage = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;

            const result = {
                success: true,
                data: {
                    student: {
                        id: student.id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        admissionNo: student.admissionNo,
                        class: student.class,
                        section: student.section,
                    },
                    month,
                    year,
                    attendance: attendanceRecords.map(r => ({
                        id: r.id,
                        date: r.date,
                        status: r.status,
                        remarks: r.remarks,
                        markedById: r.markedById,
                    })),
                    statistics: {
                        totalDays,
                        present: presentCount,
                        absent: absentCount,
                        late: lateCount,
                        leave: leaveCount,
                        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
                    },
                },
            };

            res.json(result);
        } catch (err) { next(err); }
    }

    async getMyNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            // Get query parameters
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
            const isRead = req.query.isRead ? req.query.isRead === 'true' : undefined;

            const where: any = { userId: req.user.userId };
            if (isRead !== undefined) {
                where.isRead = isRead;
            }

            const notifications = await prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
            });

            const result = {
                success: true,
                data: notifications.map(n => ({
                    id: n.id,
                    userId: n.userId,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    isRead: n.isRead,
                    createdAt: n.createdAt,
                })),
            };

            res.json(result);
        } catch (err) { next(err); }
    }

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await studentService.list(req.query);
            sendSuccess(res, result.data, 'Students retrieved', 200, { pagination: result.pagination });
        } catch (err) { next(err); }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const student = await studentService.getById(req.params.id);
            sendSuccess(res, student);
        } catch (err) { next(err); }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const student = await studentService.create(req.body);
            await prisma.auditLog.create({
                data: {
                    userId: req.user?.userId,
                    action: 'CREATE_STUDENT',
                    entity: 'Student',
                    entityId: student.id,
                    details: { admissionNo: student.admissionNo },
                    ipAddress: req.ip,
                },
            });
            sendCreated(res, student, 'Student created successfully');
        } catch (err) { next(err); }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const student = await studentService.update(req.params.id, req.body);
            await prisma.auditLog.create({
                data: {
                    userId: req.user?.userId,
                    action: 'UPDATE_STUDENT',
                    entity: 'Student',
                    entityId: student.id,
                    ipAddress: req.ip,
                },
            });
            sendSuccess(res, student, 'Student updated successfully');
        } catch (err) { next(err); }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await studentService.delete(req.params.id);
            await prisma.auditLog.create({
                data: {
                    userId: req.user?.userId,
                    action: 'DELETE_STUDENT',
                    entity: 'Student',
                    entityId: req.params.id,
                    ipAddress: req.ip,
                },
            });
            sendSuccess(res, null, 'Student deleted successfully');
        } catch (err) { next(err); }
    }

    async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await studentService.getStats();
            sendSuccess(res, stats);
        } catch (err) { next(err); }
    }

    async getDefaulters(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 75;
            const students = await studentService.getDefaulters(threshold);
            sendSuccess(res, students, `Students with attendance below ${threshold}%`);
        } catch (err) { next(err); }
    }
}

export default new StudentController();
