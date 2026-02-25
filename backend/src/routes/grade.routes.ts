import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireTeacherOrAbove } from '../middleware/role';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { NextFunction, Request, Response } from 'express';

const router = Router();
router.use(authenticate);

// Student self-service: GET /grades/my?term=Term+1&academicYear=2025-26
router.get('/my', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(403).json({ success: false, message: 'Not authenticated' });
            return;
        }
        // Find student from userId
        const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
        if (!student) {
            res.status(403).json({ success: false, message: 'User is not a student' });
            return;
        }

        const { term, academicYear } = req.query as any;
        const where: any = { studentId: student.id };
        if (term) where.term = term;
        if (academicYear) where.academicYear = academicYear;

        const grades = await prisma.academicGrade.findMany({
            where,
            orderBy: [{ academicYear: 'desc' }, { term: 'asc' }, { subject: 'asc' }],
        });

        // Calculate summary
        const totalScore = grades.reduce((s: number, g: any) => s + g.score, 0);
        const totalMaxScore = grades.reduce((s: number, g: any) => s + g.maxScore, 0);
        const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
        let overallGrade = 'N/A';
        if (percentage >= 90) overallGrade = 'A+';
        else if (percentage >= 80) overallGrade = 'A';
        else if (percentage >= 70) overallGrade = 'B+';
        else if (percentage >= 60) overallGrade = 'B';
        else if (percentage >= 50) overallGrade = 'C+';
        else if (percentage >= 40) overallGrade = 'C';
        else if (percentage > 0) overallGrade = 'F';

        sendSuccess(res, {
            grades: grades.map((g: any) => ({
                subject: g.subject,
                score: g.score,
                maxScore: g.maxScore,
                grade: g.grade,
                percentage: Math.round((g.score / g.maxScore) * 100),
                term: g.term,
                academicYear: g.academicYear,
            })),
            summary: { totalScore, totalMaxScore, percentage, overallGrade },
        });
    } catch (err) { next(err); }
});

// List grades for a student (admin/teacher use)
router.get('/student/:studentId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const grades = await prisma.academicGrade.findMany({
            where: { studentId: req.params.studentId },
            orderBy: [{ academicYear: 'desc' }, { term: 'asc' }, { subject: 'asc' }],
        });
        sendSuccess(res, grades);
    } catch (err) { next(err); }
});

// Class report
router.get('/class-report', requireTeacherOrAbove, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { class: cls, section, term, academicYear } = req.query as any;
        const grades = await prisma.academicGrade.findMany({
            where: {
                ...(term && { term }),
                ...(academicYear && { academicYear }),
                student: {
                    ...(cls && { class: cls }),
                    ...(section && { section }),
                },
            },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, rollNo: true } },
            },
            orderBy: [{ student: { rollNo: 'asc' } }, { subject: 'asc' }],
        });
        sendSuccess(res, grades);
    } catch (err) { next(err); }
});

// Bulk upload grades
router.post('/bulk', requireTeacherOrAbove, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { subject, term, academicYear, maxScore, records } = req.body;

        if (!subject || !term || !academicYear || !maxScore || !Array.isArray(records) || records.length === 0) {
            res.status(400).json({ success: false, message: 'subject, term, academicYear, maxScore, and records[] are required' });
            return;
        }

        // Look up Teacher.id from the authenticated user's userId
        const teacher = await prisma.teacher.findUnique({ where: { userId: req.user?.userId } });
        const enteredById = teacher?.id || null;

        const calcGrade = (score: number, max: number): string => {
            const pct = (score / max) * 100;
            if (pct >= 90) return 'A+';
            if (pct >= 80) return 'A';
            if (pct >= 70) return 'B+';
            if (pct >= 60) return 'B';
            if (pct >= 50) return 'C+';
            if (pct >= 40) return 'C';
            return 'F';
        };

        const results = await Promise.all(
            records.map(async (r: { studentId: string; score: number }) => {
                const grade = calcGrade(r.score, maxScore);

                // Find existing record for this student/subject/term/year
                const existing = await prisma.academicGrade.findFirst({
                    where: { studentId: r.studentId, subject, term, academicYear },
                });

                if (existing) {
                    return prisma.academicGrade.update({
                        where: { id: existing.id },
                        data: { score: r.score, maxScore, grade, enteredById },
                    });
                } else {
                    return prisma.academicGrade.create({
                        data: {
                            studentId: r.studentId,
                            subject,
                            term,
                            academicYear,
                            score: r.score,
                            maxScore,
                            grade,
                            enteredById,
                        },
                    });
                }
            })
        );

        sendCreated(res, results, `Marks saved for ${results.length} students in ${subject} — ${term}`);
    } catch (err) { next(err); }
});

// Create grade
router.post('/', requireTeacherOrAbove, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const grade = await prisma.academicGrade.create({
            data: {
                studentId: req.body.studentId,
                subject: req.body.subject,
                score: req.body.score,
                maxScore: req.body.maxScore || 100,
                grade: req.body.grade,
                term: req.body.term,
                academicYear: req.body.academicYear,
                enteredById: req.user?.userId,
            },
        });
        sendCreated(res, grade, 'Grade recorded');
    } catch (err) { next(err); }
});

// Update grade
router.put('/:id', requireTeacherOrAbove, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.academicGrade.findUnique({ where: { id: req.params.id } });
        if (!existing) throw new NotFoundError('Grade');
        const grade = await prisma.academicGrade.update({
            where: { id: req.params.id },
            data: {
                score: req.body.score,
                maxScore: req.body.maxScore,
                grade: req.body.grade,
            },
        });
        sendSuccess(res, grade, 'Grade updated');
    } catch (err) { next(err); }
});

// Delete grade
router.delete('/:id', requireTeacherOrAbove, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.academicGrade.findUnique({ where: { id: req.params.id } });
        if (!existing) throw new NotFoundError('Grade');
        await prisma.academicGrade.delete({ where: { id: req.params.id } });
        sendSuccess(res, null, 'Grade deleted');
    } catch (err) { next(err); }
});

export default router;
