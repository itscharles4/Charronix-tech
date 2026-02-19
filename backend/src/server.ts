import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import cache from './services/cache.service';
import logger from './utils/logger';

const startServer = async () => {
    try {
        // Connect to Redis (optional - app works without it)
        if (env.REDIS_ENABLED) {
            try {
                await cache.connect();
            } catch (redisErr) {
                logger.warn('⚠️  Redis unavailable - running without cache:', (redisErr as Error).message);
            }
        }

        // Test DB connection
        await prisma.$connect();
        logger.info('✅ Database connected');

        const server = app.listen(env.PORT, () => {
            logger.info(`🚀 Charronix Backend running on port ${env.PORT}`);
            logger.info(`📍 Environment: ${env.NODE_ENV}`);
            logger.info(`🔗 API: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
            logger.info(`❤️  Health: http://localhost:${env.PORT}/health`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                await prisma.$disconnect();
                logger.info('💤 Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        process.on('unhandledRejection', (reason) => {
            logger.error('Unhandled Rejection:', reason);
        });

        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception:', err);
            process.exit(1);
        });

    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
