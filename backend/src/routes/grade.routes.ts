import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireTeacherOrAbove } from '../middleware/role';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// List grades for a student
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
