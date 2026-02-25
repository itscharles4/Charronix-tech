import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import teacherService from '../services/teacher.service';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import prisma from '../config/database';

export class TeacherController {
    async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await teacherService.list(req.query);
            sendSuccess(res, result.data, 'Teachers retrieved', 200, { pagination: result.pagination });
        } catch (err) { next(err); }
    }

    async getMe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const teacherId = req.user?.teacherId;
            if (!teacherId) {
                return next(new Error('User is not a teacher'));
            }
            const teacher = await teacherService.getById(teacherId);
            sendSuccess(res, teacher);
        } catch (err) { next(err); }
    }

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const teacher = await teacherService.getById(req.params.id);
            sendSuccess(res, teacher);
        } catch (err) { next(err); }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const teacher = await teacherService.create(req.body);
            await prisma.auditLog.create({
                data: { userId: req.user?.userId, action: 'CREATE_TEACHER', entity: 'Teacher', entityId: teacher.id, ipAddress: req.ip },
            });
            sendCreated(res, teacher, 'Teacher created successfully');
        } catch (err) { next(err); }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const teacher = await teacherService.update(req.params.id, req.body);
            await prisma.auditLog.create({
                data: { userId: req.user?.userId, action: 'UPDATE_TEACHER', entity: 'Teacher', entityId: teacher.id, ipAddress: req.ip },
            });
            sendSuccess(res, teacher, 'Teacher updated successfully');
        } catch (err) { next(err); }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await teacherService.delete(req.params.id);
            await prisma.auditLog.create({
                data: { userId: req.user?.userId, action: 'DELETE_TEACHER', entity: 'Teacher', entityId: req.params.id, ipAddress: req.ip },
            });
            sendSuccess(res, null, 'Teacher deleted successfully');
        } catch (err) { next(err); }
    }
}

export default new TeacherController();
