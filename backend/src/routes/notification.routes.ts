import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';
import { NotificationService } from '../services/notification.service';
import prisma from '../config/database';

const router = Router();
router.use(authenticate);

// ─────────────────────────────────────────────
// GET /notifications  — inbox for current user
// ─────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { category, isRead, limit, offset } = req.query;
        const result = await NotificationService.getUserNotifications(req.user!.userId, {
            category: category as string,
            isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
            limit: limit ? parseInt(limit as string) : 50,
            offset: offset ? parseInt(offset as string) : 0,
        });
        res.json(result);
    } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// GET /notifications/unread-count
// ─────────────────────────────────────────────
router.get('/unread-count', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await NotificationService.getUnreadCount(req.user!.userId);
        res.json(result);
    } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// PUT /notifications/read-all
// ─────────────────────────────────────────────
router.put('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await NotificationService.markAllAsRead(req.user!.userId);
        res.json(result);
    } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// PUT /notifications/:id/read
// ─────────────────────────────────────────────
router.put('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await NotificationService.markAsRead(req.params.id, req.user!.userId);
        res.json(result);
    } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// GET /notifications/sent  — Sent history for current user
// ─────────────────────────────────────────────
router.get('/sent', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { limit, offset } = req.query;
        const result = await NotificationService.getSentNotifications(
            req.user!.userId,
            limit ? parseInt(limit as string) : 50,
            offset ? parseInt(offset as string) : 0,
        );
        res.json(result);
    } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// POST /notifications/send  — Teacher / Principal / Admin
// ─────────────────────────────────────────────
router.post('/send', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userRole = req.user!.role;

        if (!['TEACHER', 'PRINCIPAL', 'ADMIN'].includes(userRole)) {
            return res.status(403).json({ success: false, message: 'Only teachers and admins can send notifications' });
        }

        const { targetType, targetStudentId, targetTeacherId, title, message, category, priority, iconEmoji } = req.body;

        if (!targetType || !title || !message) {
            return res.status(400).json({ success: false, message: 'targetType, title, and message are required' });
        }

        // Resolve sender display name
        let senderName = 'School';
        if (userRole === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({
                where: { userId: req.user!.userId },
                select: { firstName: true, lastName: true },
            });
            senderName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Teacher';
        } else if (userRole === 'PRINCIPAL') {
            // Try to look up principal's actual name from teacher table
            const principal = await prisma.teacher.findFirst({
                where: { userId: req.user!.userId },
                select: { firstName: true, lastName: true },
            });
            senderName = principal ? `${principal.firstName} ${principal.lastName}` : 'Principal';
        } else if (userRole === 'ADMIN') {
            senderName = 'Admin';
        }

        const senderData = {
            senderUserId: req.user!.userId,
            senderName,
            senderRole: userRole,
            title,
            message,
            category: category || 'GENERAL',
            priority: priority || 'NORMAL',
            iconEmoji,
        };

        let result;
        if (targetType === 'ALL_STUDENTS') {
            result = await NotificationService.sendToAllStudents(senderData);
        } else if (targetType === 'SPECIFIC_STUDENT') {
            if (!targetStudentId) {
                return res.status(400).json({ success: false, message: 'targetStudentId is required for SPECIFIC_STUDENT' });
            }
            result = await NotificationService.sendToSpecificStudent({ ...senderData, targetStudentId });
        } else if (targetType === 'ALL_TEACHERS') {
            result = await NotificationService.sendToAllTeachers(senderData);
        } else if (targetType === 'SPECIFIC_TEACHER') {
            if (!targetTeacherId) {
                return res.status(400).json({ success: false, message: 'targetTeacherId is required for SPECIFIC_TEACHER' });
            }
            result = await NotificationService.sendToSpecificTeacher({ ...senderData, targetTeacherId });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid targetType' });
        }

        return res.status(201).json(result);
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to send notification' });
    }
});

// ─────────────────────────────────────────────
// DELETE /notifications/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await NotificationService.deleteNotification(req.params.id, req.user!.userId);
        res.json(result);
    } catch (err) { next(err); }
});

export default router;
