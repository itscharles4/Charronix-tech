import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/role';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Get all settings (admin) or public settings (others)
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'PRINCIPAL';
        const settings = await prisma.systemSetting.findMany({
            where: isAdmin ? {} : { category: 'SCHOOL' },
            orderBy: [{ category: 'asc' }, { key: 'asc' }],
        });
        sendSuccess(res, settings);
    } catch (err) { next(err); }
});

// Get specific setting
router.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const setting = await prisma.systemSetting.findUnique({ where: { key: req.params.key } });
        if (!setting) throw new NotFoundError('Setting');
        sendSuccess(res, setting);
    } catch (err) { next(err); }
});

// Update setting (admin only)
router.put('/:key', requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const setting = await prisma.systemSetting.upsert({
            where: { key: req.params.key },
            update: { value: req.body.value, updatedBy: req.user?.userId },
            create: {
                key: req.params.key,
                value: req.body.value,
                category: req.body.category || 'SCHOOL',
                updatedBy: req.user?.userId,
            },
        });
        sendSuccess(res, setting, 'Setting updated');
    } catch (err) { next(err); }
});

export default router;
