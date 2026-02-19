import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireTeacherOrAbove } from '../middleware/role';
import { sendSuccess } from '../utils/apiResponse';
import { NextFunction, Request, Response } from 'express';

const router = Router();
router.use(authenticate, requireTeacherOrAbove);

// Attendance trends (last N days)
router.get('/attendance-trends', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const days = parseInt(req.query.days as string || '30');
        const since = new Date();
        since.setDate(since.getDate() - days);

        const records = await prisma.attendance.groupBy({
            by: ['date', 'status'],
            where: { date: { gte: since } },
            _count: { id: true },
            orderBy: { date: 'asc' },
        });

        // Pivot into date → { present, absent, late } format
        const map: Record<string, any> = {};
        for (const r of records) {
            const d = r.date.toISOString().split('T')[0];
            if (!map[d]) map[d] = { date: d, PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 };
            map[d][r.status] = r._count.id;
        }

        sendSuccess(res, Object.values(map));
    } catch (err) { next(err); }
});

// Grade distribution by class
router.get('/grade-distribution', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { term, academicYear } = req.query as any;
        const grades = await prisma.academicGrade.groupBy({
            by: ['grade'],
            where: {
                ...(term && { term }),
                ...(academicYear && { academicYear }),
            },
            _count: { id: true },
        });
        sendSuccess(res, grades);
    } catch (err) { next(err); }
});

// Teacher workload
router.get('/teacher-workload', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const teachers = await prisma.teacher.findMany({
            where: { status: 'ACTIVE' },
            include: {
                subjects: true,
                classes: true,
                _count: { select: { attendance: true } },
            },
        });

        const workload = teachers.map(t => ({
            id: t.id,
            name: `${t.firstName} ${t.lastName}`,
            subjectCount: t.subjects.length,
            classCount: t.classes.length,
            attendanceMarked: t._count.attendance,
        }));

        sendSuccess(res, workload);
    } catch (err) { next(err); }
});

// Student performance trends
router.get('/student-performance', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { class: cls, section, academicYear } = req.query as any;
        const grades = await prisma.academicGrade.findMany({
            where: {
                ...(academicYear && { academicYear }),
                student: {
                    ...(cls && { class: cls }),
                    ...(section && { section }),
                    status: 'ACTIVE',
                },
            },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, rollNo: true } },
            },
        });

        // Group by student and calculate average
        const studentMap: Record<string, any> = {};
        for (const g of grades) {
            const sid = g.studentId;
            if (!studentMap[sid]) {
                studentMap[sid] = {
                    student: g.student,
                    scores: [],
                    subjects: {},
                };
            }
            studentMap[sid].scores.push(Number(g.score));
            studentMap[sid].subjects[g.subject] = Number(g.score);
        }

        const result = Object.values(studentMap).map((s: any) => ({
            ...s,
            average: s.scores.length > 0
                ? Math.round(s.scores.reduce((a: number, b: number) => a + b, 0) / s.scores.length * 100) / 100
                : 0,
        }));

        sendSuccess(res, result);
    } catch (err) { next(err); }
});

export default router;
