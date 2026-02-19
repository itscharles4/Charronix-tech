import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

const prisma = global.__prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, 'error', 'warn']
        : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
}

// Log slow queries in development
if (process.env.NODE_ENV === 'development') {
    (prisma as any).$on('query', (e: any) => {
        if (e.duration > 200) {
            logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
    });
}

export default prisma;
