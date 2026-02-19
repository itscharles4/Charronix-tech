import { Request, Response, NextFunction } from 'express';
import studentService from '../services/student.service';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import prisma from '../config/database';

export class StudentController {
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
