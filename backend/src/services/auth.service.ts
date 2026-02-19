import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UnauthorizedError, NotFoundError, ConflictError } from '../utils/errors';

import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';

export class AuthService {
    async login(email: string, password: string, ipAddress: string, userAgent: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                student: { select: { id: true, firstName: true, lastName: true } },
                teacher: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        if (!user) throw new UnauthorizedError('Invalid email or password');
        if (!user.isActive) throw new UnauthorizedError('Account is deactivated');

        // Check account lock
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            throw new UnauthorizedError(`Account locked. Try again in ${minutesLeft} minutes`);
        }

        const isValid = await comparePassword(password, user.passwordHash);

        if (!isValid) {
            const newAttempts = user.loginAttempts + 1;
            const updates: any = { loginAttempts: newAttempts };

            if (newAttempts >= env.MAX_LOGIN_ATTEMPTS) {
                updates.lockedUntil = new Date(Date.now() + env.ACCOUNT_LOCK_DURATION_MINUTES * 60000);
                updates.loginAttempts = 0;
            }

            await prisma.user.update({ where: { id: user.id }, data: updates });
            throw new UnauthorizedError('Invalid email or password');
        }

        // Reset login attempts on success
        await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
        });

        const accessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
            email: user.email,
        });

        const tokenId = uuidv4();
        const refreshToken = generateRefreshToken({ userId: user.id, tokenId });

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                id: tokenId,
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                device: userAgent?.substring(0, 200),
                ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN_SUCCESS',
                entity: 'User',
                entityId: user.id,
                ipAddress,
                userAgent: userAgent?.substring(0, 500),
            },
        });

        const profile = user.student
            ? { ...user.student, type: 'student' }
            : user.teacher
                ? { ...user.teacher, type: 'teacher' }
                : { type: 'admin' };

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile,
            },
        };
    }

    async register(email: string, password: string, role: Role) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new ConflictError('Email already registered');

        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, passwordHash, role },
            select: { id: true, email: true, role: true, createdAt: true },
        });

        return user;
    }

    async refreshTokens(refreshToken: string) {
        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        const stored = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
            throw new UnauthorizedError('Refresh token is invalid or expired');
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, role: true, isActive: true },
        });

        if (!user || !user.isActive) throw new UnauthorizedError('User not found or inactive');

        // Revoke old token (rotation)
        await prisma.refreshToken.update({
            where: { id: stored.id },
            data: { isRevoked: true },
        });

        const newAccessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
            email: user.email,
        });

        const newTokenId = uuidv4();
        const newRefreshToken = generateRefreshToken({ userId: user.id, tokenId: newTokenId });

        await prisma.refreshToken.create({
            data: {
                id: newTokenId,
                userId: user.id,
                token: newRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundError('User');

        const isValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isValid) throw new UnauthorizedError('Current password is incorrect');

        const passwordHash = await hashPassword(newPassword);
        await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

        // Revoke all refresh tokens (force re-login)
        await prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });

        await prisma.auditLog.create({
            data: {
                userId,
                action: 'CHANGE_PASSWORD',
                entity: 'User',
                entityId: userId,
            },
        });
    }

    async getSessions(userId: string) {
        return prisma.session.findMany({
            where: { userId, isActive: true, expiresAt: { gt: new Date() } },
            orderBy: { lastActivity: 'desc' },
        });
    }

    async revokeSession(userId: string, sessionId: string) {
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session) throw new NotFoundError('Session');

        await prisma.session.update({
            where: { id: sessionId },
            data: { isActive: false },
        });
    }

    async revokeAllSessions(userId: string) {
        await prisma.session.updateMany({
            where: { userId },
            data: { isActive: false },
        });
        await prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true },
        });
    }

    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                lastLoginAt: true,
                profilePhotoUrl: true,
                preferences: true,
                student: {
                    select: {
                        id: true, firstName: true, lastName: true,
                        class: true, section: true, admissionNo: true,
                    },
                },
                teacher: {
                    select: {
                        id: true, firstName: true, lastName: true,
                        employeeId: true, subjects: true,
                    },
                },
            },
        });
        if (!user) throw new NotFoundError('User');
        return user;
    }
}

export default new AuthService();
