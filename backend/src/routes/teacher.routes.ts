import { Router } from 'express';
import teacherController from '../controllers/teacher.controller';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireAdminOrPrincipal } from '../middleware/role';
import { validate } from '../middleware/validate';
import { createTeacherSchema, updateTeacherSchema, listTeachersSchema } from '../validators/teacher.validator';
import { sendSuccess } from '../utils/apiResponse';
import { NextFunction, Response } from 'express';
import prisma from '../config/database';

const router = Router();
router.use(authenticate);

router.get('/me', teacherController.getMe);

// Get students for the authenticated teacher's classes (with optional ?class=&section= filter)
router.get('/my-students', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(403).json({ success: false, message: 'Not authenticated' });
            return;
        }

        // Find the teacher record
        const teacher = await prisma.teacher.findUnique({
            where: { userId },
            include: { classes: true },
        });
        if (!teacher) {
            res.status(403).json({ success: false, message: 'User is not a teacher' });
            return;
        }

        // Build class/section filter
        const { class: cls, section } = req.query as any;
        const where: any = { status: 'ACTIVE' };

        if (cls && section) {
            where.class = cls;
            where.section = section;
        } else if (teacher.classes && teacher.classes.length > 0) {
            // Return students from all of this teacher's assigned classes
            where.OR = teacher.classes.map((tc: any) => {
                const parts = tc.classSection.split('-');
                return { class: parts[0], section: parts[1] };
            });
        }

        const students = await prisma.student.findMany({
            where,
            orderBy: [{ class: 'asc' }, { section: 'asc' }, { rollNo: 'asc' }],
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNo: true,
                class: true,
                section: true,
                rollNo: true,
                attendancePercentage: true,
            },
        });

        sendSuccess(res, students, `${students.length} students found`);
    } catch (err) { next(err); }
});

router.get('/', validate(listTeachersSchema), teacherController.list);
router.get('/:id', teacherController.getById);
router.post('/', requireAdminOrPrincipal, validate(createTeacherSchema), teacherController.create);
router.put('/:id', requireAdminOrPrincipal, validate(updateTeacherSchema), teacherController.update);
router.delete('/:id', requireAdminOrPrincipal, teacherController.delete);

export default router;
