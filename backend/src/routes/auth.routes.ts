import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import {
    loginSchema,
    registerSchema,
    changePasswordSchema,
    refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// Protected routes
router.use(authenticate);
router.get('/me', authController.me);
router.post('/logout', authController.logout);
router.put('/change-password', validate(changePasswordSchema), authController.changePassword);
router.get('/sessions', authController.getSessions);
router.delete('/sessions/all', authController.revokeAllSessions);
router.delete('/sessions/:id', authController.revokeSession);

export default router;
