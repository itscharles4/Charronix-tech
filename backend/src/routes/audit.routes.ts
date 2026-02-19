import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/role';
import { sendSuccess } from '../utils/apiResponse';
import { NextFunction, Request, Response } from 'express';
import { parsePaginationParams, getPrismaSkipTake, buildPaginationMeta } from '../utils/pagination';

const router = Router();
router.use(authenticate, requireAdmin);

// Get audit logs
router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = parsePaginationParams(req.query.page as string, req.query.limit as string);
        const { action, entity, userId } = req.query as any;

        const where: any = {};
        if (action) where.action = { contains: action, mode: 'insensitive' };
        if (entity) where.entity = entity;
        if (userId) where.userId = userId;

        const [data, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                ...getPrismaSkipTake(page, limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, email: true, role: true } },
                },
            }),
            prisma.auditLog.count({ where }),
        ]);

        sendSuccess(res, data, 'Audit logs retrieved', 200, { pagination: buildPaginationMeta(page, limit, total) });
    } catch (err) { next(err); }
});

// User-specific audit trail
router.get('/logs/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = parsePaginationParams(req.query.page as string, req.query.limit as string);
        const [data, total] = await Promise.all([
            prisma.auditLog.findMany({
                where: { userId: req.params.userId },
                ...getPrismaSkipTake(page, limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.auditLog.count({ where: { userId: req.params.userId } }),
        ]);
        sendSuccess(res, data, 'User audit trail retrieved', 200, { pagination: buildPaginationMeta(page, limit, total) });
    } catch (err) { next(err); }
});

export default router;
