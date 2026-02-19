import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { sendUnauthorized } from '../utils/apiResponse';
import prisma from '../config/database';

export interface AuthRequest extends Request {
    user?: JwtPayload;
    sessionId?: string;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            sendUnauthorized(res, 'No token provided');
            return;
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyAccessToken(token);

        // Verify user still exists and is active
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, isActive: true, lockedUntil: true },
        });

        if (!user || !user.isActive) {
            sendUnauthorized(res, 'Account is inactive or does not exist');
            return;
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
            sendUnauthorized(res, 'Account is temporarily locked');
            return;
        }

        req.user = payload;
        next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            sendUnauthorized(res, 'Token expired');
        } else if (err.name === 'JsonWebTokenError') {
            sendUnauthorized(res, 'Invalid token');
        } else {
            next(err);
        }
    }
};

export const optionalAuth = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            req.user = verifyAccessToken(token);
        }
    } catch {
        // Ignore errors for optional auth
    }
    next();
};
