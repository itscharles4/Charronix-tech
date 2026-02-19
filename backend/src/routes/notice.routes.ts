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

// List notices
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { target, type, priority } = req.query as any;
        const notices = await prisma.notice.findMany({
            where: {
                ...(target && { target }),
                ...(type && { type }),
                ...(priority && { priority }),
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            orderBy: [{ priority: 'desc' }, { date: 'desc' }],
        });
        sendSuccess(res, notices);
    } catch (err) { next(err); }
});

// Get single notice
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notice = await prisma.notice.findUnique({ where: { id: req.params.id } });
        if (!notice) throw new NotFoundError('Notice');
        sendSuccess(res, notice);
    } catch (err) { next(err); }
});

// Create notice
router.post('/', requireTeacherOrAbove, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const notice = await prisma.notice.create({
            data: {
                title: req.body.title,
                message: req.body.message,
                target: req.body.target,
                date: new Date(req.body.date || Date.now()),
                author: req.body.author,
                type: req.body.type || 'GENERAL',
                priority: req.body.priority || 'NORMAL',
                expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
                createdById: req.user?.userId,
            },
        });
        sendCreated(res, notice, 'Notice created');
    } catch (err) { next(err); }
});

// Update notice
router.put('/:id', requireTeacherOrAbove, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.notice.findUnique({ where: { id: req.params.id } });
        if (!existing) throw new NotFoundError('Notice');
        const notice = await prisma.notice.update({
            where: { id: req.params.id },
            data: {
                title: req.body.title,
                message: req.body.message,
                target: req.body.target,
                priority: req.body.priority,
                expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
            },
        });
        sendSuccess(res, notice, 'Notice updated');
    } catch (err) { next(err); }
});

// Delete notice
router.delete('/:id', requireTeacherOrAbove, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await prisma.notice.findUnique({ where: { id: req.params.id } });
        if (!existing) throw new NotFoundError('Notice');
        await prisma.notice.delete({ where: { id: req.params.id } });
        sendSuccess(res, null, 'Notice deleted');
    } catch (err) { next(err); }
});

export default router;
