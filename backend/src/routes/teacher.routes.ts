import { Router } from 'express';
import teacherService from '../services/teacher.service';
import { authenticate } from '../middleware/auth';
import { requireAdminOrPrincipal } from '../middleware/role';

import { validate } from '../middleware/validate';
import { createTeacherSchema, updateTeacherSchema, listTeachersSchema } from '../validators/teacher.validator';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();
router.use(authenticate);

router.get('/', validate(listTeachersSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await teacherService.list(req.query);
        sendSuccess(res, result.data, 'Teachers retrieved', 200, { pagination: result.pagination });
    } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacher = await teacherService.getById(req.params.id);
        sendSuccess(res, teacher);
    } catch (err) { next(err); }
});

router.post('/', requireAdminOrPrincipal, validate(createTeacherSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacher = await teacherService.create(req.body);
        await prisma.auditLog.create({
            data: { userId: req.user?.userId, action: 'CREATE_TEACHER', entity: 'Teacher', entityId: teacher.id, ipAddress: req.ip },
        });
        sendCreated(res, teacher, 'Teacher created successfully');
    } catch (err) { next(err); }
});

router.put('/:id', requireAdminOrPrincipal, validate(updateTeacherSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const teacher = await teacherService.update(req.params.id, req.body);
        await prisma.auditLog.create({
            data: { userId: req.user?.userId, action: 'UPDATE_TEACHER', entity: 'Teacher', entityId: teacher.id, ipAddress: req.ip },
        });
        sendSuccess(res, teacher, 'Teacher updated successfully');
    } catch (err) { next(err); }
});

router.delete('/:id', requireAdminOrPrincipal, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await teacherService.delete(req.params.id);
        await prisma.auditLog.create({
            data: { userId: req.user?.userId, action: 'DELETE_TEACHER', entity: 'Teacher', entityId: req.params.id, ipAddress: req.ip },
        });
        sendSuccess(res, null, 'Teacher deleted successfully');
    } catch (err) { next(err); }
});

export default router;
