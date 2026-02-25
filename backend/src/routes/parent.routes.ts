import { Router } from 'express';
import parentController from '../controllers/parent.controller';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/role';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRoles(Role.PARENT, Role.ADMIN));

router.get('/me', parentController.getMe);
router.get('/child/:studentId/stats', parentController.getChildStats);

export default router;
