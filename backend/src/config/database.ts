import { PrismaClient } from '../generated/client';
import logger from '../utils/logger';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, 'error', 'warn']
        : ['error'],
});

// Log slow queries in development
if (process.env.NODE_ENV === 'development') {
    (prisma as any).$on('query', (e: any) => {
        if (e.duration > 200) {
            logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
    });
}

export default prisma;
