import Redis from 'ioredis';
import { env } from '../config/env';
import logger from '../utils/logger';

class CacheService {
    private redis: Redis;
    private isConnected = false;

    constructor() {
        this.redis = new Redis(env.REDIS_URL, {
            retryStrategy: (times: number) => Math.min(times * 50, 2000),
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });

        this.redis.on('connect', () => {
            this.isConnected = true;
            logger.info('✅ Redis connected');
        });

        this.redis.on('error', (err: Error) => {
            this.isConnected = false;
            logger.error('Redis error:', err.message);
        });
    }


    async connect(): Promise<void> {
        await this.redis.connect();
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.isConnected) return null;
        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    async set(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
        if (!this.isConnected) return;
        try {
            await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        } catch (err) {
            logger.warn('Cache set failed:', err);
        }
    }

    async delete(key: string): Promise<void> {
        if (!this.isConnected) return;
        try {
            await this.redis.del(key);
        } catch (err) {
            logger.warn('Cache delete failed:', err);
        }
    }

    async deletePattern(pattern: string): Promise<void> {
        if (!this.isConnected) return;
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) await this.redis.del(...keys);
        } catch (err) {
            logger.warn('Cache deletePattern failed:', err);
        }
    }

    async exists(key: string): Promise<boolean> {
        if (!this.isConnected) return false;
        try {
            return (await this.redis.exists(key)) === 1;
        } catch {
            return false;
        }
    }

    async increment(key: string, ttlSeconds?: number): Promise<number> {
        if (!this.isConnected) return 0;
        try {
            const count = await this.redis.incr(key);
            if (ttlSeconds && count === 1) await this.redis.expire(key, ttlSeconds);
            return count;
        } catch {
            return 0;
        }
    }

    getClient(): Redis {
        return this.redis;
    }
}

export default new CacheService();
