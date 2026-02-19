import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendCreated } from '../utils/apiResponse';


export class AuthController {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
            const userAgent = req.headers['user-agent'] || '';
            const result = await authService.login(email, password, ipAddress, userAgent);
            sendSuccess(res, result, 'Login successful');
        } catch (err) {
            next(err);
        }
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password, role } = req.body;
            const user = await authService.register(email, password, role);
            sendCreated(res, user, 'User registered successfully');
        } catch (err) {
            next(err);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refreshTokens(refreshToken);
            sendSuccess(res, tokens, 'Tokens refreshed');
        } catch (err) {
            next(err);
        }
    }

    async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await authService.getMe(req.user!.userId);
            sendSuccess(res, user);
        } catch (err) {
            next(err);
        }
    }

    async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { currentPassword, newPassword } = req.body;
            await authService.changePassword(req.user!.userId, currentPassword, newPassword);
            sendSuccess(res, null, 'Password changed successfully');
        } catch (err) {
            next(err);
        }
    }

    async getSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const sessions = await authService.getSessions(req.user!.userId);
            sendSuccess(res, sessions);
        } catch (err) {
            next(err);
        }
    }

    async revokeSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await authService.revokeSession(req.user!.userId, req.params.id);
            sendSuccess(res, null, 'Session revoked');
        } catch (err) {
            next(err);
        }
    }

    async revokeAllSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await authService.revokeAllSessions(req.user!.userId);
            sendSuccess(res, null, 'All sessions revoked');
        } catch (err) {
            next(err);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Revoke all tokens for this user
            await authService.revokeAllSessions(req.user!.userId);
            sendSuccess(res, null, 'Logged out successfully');
        } catch (err) {
            next(err);
        }
    }
}

export default new AuthController();
