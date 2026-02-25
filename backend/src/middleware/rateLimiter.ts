import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const globalRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
});

export const authRateLimiter = rateLimit({
    windowMs: 15 * 1000, // 15 seconds
    max: 5, // 5 login attempts per 15 sec
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use login identifier if available, fallback to IP
        return (req.body?.email || req.body?.identifier || req.ip).toString();
    },
    message: {
        success: false,
        message: 'Too many login attempts, please try again in 15 seconds',
    },
});

export const strictRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests for this action',
    },
});
