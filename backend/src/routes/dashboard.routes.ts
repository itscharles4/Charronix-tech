import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';
import { NextFunction, Request, Response } from 'express';

const router = Router();
router.use(authenticate);

// Dashboard stats
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalStudents, totalTeachers, todayPresent, todayAbsent, activeNotices, openComplaints] = await Promise.all([
            prisma.student.count({ where: { status: 'ACTIVE' } }),
            prisma.teacher.count({ where: { status: 'ACTIVE' } }),
            prisma.attendance.count({ where: { date: today, status: 'PRESENT' } }),
            prisma.attendance.count({ where: { date: today, status: 'ABSENT' } }),
            prisma.notice.count({
                where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
            }),
            prisma.complaint.count({ where: { status: 'OPEN' } }),
        ]);

        const todayTotal = todayPresent + todayAbsent;
        const attendanceRate = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

        sendSuccess(res, {
            totalStudents,
            totalTeachers,
            todayAttendance: { present: todayPresent, absent: todayAbsent, total: todayTotal, rate: attendanceRate },
            activeNotices,
            openComplaints,
        });
    } catch (err) { next(err); }
});

// Recent activity
router.get('/recent', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const [recentStudents, recentNotices, recentComplaints] = await Promise.all([
            prisma.student.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, firstName: true, lastName: true, class: true, section: true, createdAt: true },
            }),
            prisma.notice.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, type: true, priority: true, date: true },
            }),
            prisma.complaint.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { student: { select: { firstName: true, lastName: true } } },
            }),
        ]);

        sendSuccess(res, { recentStudents, recentNotices, recentComplaints });
    } catch (err) { next(err); }
});

// Alerts (critical items needing attention)
router.get('/alerts', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const [lowAttendance, openComplaints, urgentNotices] = await Promise.all([
            prisma.student.count({ where: { status: 'ACTIVE', attendancePercentage: { lt: 75 } } }),
            prisma.complaint.count({ where: { status: 'OPEN', severity: 'HIGH' } }),
            prisma.notice.count({ where: { priority: 'URGENT', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }),
        ]);

        sendSuccess(res, {
            alerts: [
                ...(lowAttendance > 0 ? [{ type: 'WARNING', message: `${lowAttendance} students have attendance below 75%`, count: lowAttendance }] : []),
                ...(openComplaints > 0 ? [{ type: 'ERROR', message: `${openComplaints} high-severity complaints need attention`, count: openComplaints }] : []),
                ...(urgentNotices > 0 ? [{ type: 'INFO', message: `${urgentNotices} urgent notices active`, count: urgentNotices }] : []),
            ],
        });
    } catch (err) { next(err); }
});

export default router;
