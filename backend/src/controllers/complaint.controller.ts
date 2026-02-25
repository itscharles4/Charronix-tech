import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import complaintService from '../services/complaint.service';
import { sendSuccess, sendCreated, sendBadRequest, sendForbidden } from '../utils/apiResponse';
import { ComplaintSeverity, ComplaintStatus } from '@prisma/client';
import prisma from '../config/database';

export class ComplaintController {

    /**
     * POST /api/v1/complaints
     * Teacher raises a complaint about a student
     */
    async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { studentId, severity, description } = req.body;
            const teacherId = req.user?.teacherId;

            if (!teacherId) {
                sendForbidden(res, 'Only teachers can raise complaints');
                return;
            }

            if (!studentId || !severity || !description) {
                sendBadRequest(res, 'studentId, severity, and description are required');
                return;
            }

            if (!Object.values(ComplaintSeverity).includes(severity)) {
                sendBadRequest(res, `severity must be one of: ${Object.values(ComplaintSeverity).join(', ')}`);
                return;
            }

            const complaint = await complaintService.create({
                studentId,
                teacherId,
                severity,
                description,
            });

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    userId: req.user?.userId,
                    action: 'CREATE_COMPLAINT',
                    entity: 'Complaint',
                    entityId: complaint.id,
                    ipAddress: req.ip,
                },
            });

            sendCreated(res, complaint, 'Complaint submitted successfully');
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/v1/complaints/student/:studentId
     * Get complaints for a specific student
     */
    async getByStudent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { studentId } = req.params;
            const complaints = await complaintService.getByStudent(studentId);
            sendSuccess(res, complaints, 'Complaints retrieved');
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/v1/complaints/my-raised
     * Get complaints raised by the authenticated teacher
     */
    async getMyRaised(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const teacherId = req.user?.teacherId;
            if (!teacherId) {
                sendForbidden(res, 'Only teachers can access this');
                return;
            }
            const complaints = await complaintService.getByTeacher(teacherId);
            sendSuccess(res, complaints, 'Teacher complaints retrieved');
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/v1/complaints/:id/status
     * Update complaint status (Admin/Teacher)
     */
    async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!Object.values(ComplaintStatus).includes(status)) {
                sendBadRequest(res, `status must be one of: ${Object.values(ComplaintStatus).join(', ')}`);
                return;
            }

            const complaint = await complaintService.updateStatus(id, status);

            await prisma.auditLog.create({
                data: {
                    userId: req.user?.userId,
                    action: 'UPDATE_COMPLAINT_STATUS',
                    entity: 'Complaint',
                    entityId: id,
                    details: { status },
                    ipAddress: req.ip,
                },
            });

            sendSuccess(res, complaint, 'Complaint status updated');
        } catch (err) {
            next(err);
        }
    }
}

export default new ComplaintController();
