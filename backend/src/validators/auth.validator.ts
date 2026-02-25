import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().min(1, 'Email or Login ID is required'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        role: z.enum(['ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT']),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});
