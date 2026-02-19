import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/role';
import { sendSuccess } from '../utils/apiResponse';
import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { parsePaginationParams, getPrismaSkipTake, buildPaginationMeta } from '../utils/pagination';

const router = Router();
router.use(authenticate);

// Get my notifications
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = parsePaginationParams(req.query.page as string, req.query.limit as string);
        const [data, total] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: req.user!.userId },
                ...getPrismaSkipTake(page, limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({ where: { userId: req.user!.userId } }),
        ]);
        sendSuccess(res, data, 'Notifications retrieved', 200, { pagination: buildPaginationMeta(page, limit, total) });
    } catch (err) { next(err); }
});

// Mark one as read
router.put('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await prisma.notification.updateMany({
            where: { id: req.params.id, userId: req.user!.userId },
            data: { isRead: true },
        });
        sendSuccess(res, null, 'Notification marked as read');
    } catch (err) { next(err); }
});

// Mark all as read
router.put('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user!.userId, isRead: false },
            data: { isRead: true },
        });
        sendSuccess(res, null, 'All notifications marked as read');
    } catch (err) { next(err); }
});

// Admin: Send notification to users
router.post('/send', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userIds, title, message, type = 'INFO', actionUrl } = req.body;
        await prisma.notification.createMany({
            data: userIds.map((userId: string) => ({
                userId, title, message, type, actionUrl,
            })),
        });
        sendSuccess(res, null, `Notification sent to ${userIds.length} users`);
    } catch (err) { next(err); }
});

export default router;
