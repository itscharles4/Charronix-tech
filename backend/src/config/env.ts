import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('5000'),
    API_VERSION: z.string().default('v1'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    REDIS_ENABLED: z.string().default('false'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
    MAX_FILE_SIZE: z.string().default('5242880'),
    UPLOAD_DIR: z.string().default('./uploads'),
    ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/jpg,application/pdf'),
    GOOGLE_AI_API_KEY: z.string().optional(),
    GOOGLE_AI_MODEL: z.string().default('gemini-1.5-flash'),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_PHONE_NUMBER: z.string().optional(),
    TWILIO_ENABLED: z.string().default('false'),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().default('587'),
    SMTP_SECURE: z.string().default('false'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.string().default('Charronix School <noreply@charronix.com>'),
    EMAIL_ENABLED: z.string().default('false'),
    RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
    BCRYPT_ROUNDS: z.string().default('12'),
    PASSWORD_MIN_LENGTH: z.string().default('8'),
    MAX_LOGIN_ATTEMPTS: z.string().default('5'),
    ACCOUNT_LOCK_DURATION_SECONDS: z.string().default('15'),
    ACCOUNT_LOCK_DURATION_MINUTES: z.string().default('30'),
    LOG_LEVEL: z.string().default('info'),
    LOG_FILE: z.string().default('./logs/app.log'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = {
    ...parsed.data,
    PORT: parseInt(parsed.data.PORT, 10),
    MAX_FILE_SIZE: parseInt(parsed.data.MAX_FILE_SIZE, 10),
    RATE_LIMIT_WINDOW_MS: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
    BCRYPT_ROUNDS: parseInt(parsed.data.BCRYPT_ROUNDS, 10),
    PASSWORD_MIN_LENGTH: parseInt(parsed.data.PASSWORD_MIN_LENGTH, 10),
    MAX_LOGIN_ATTEMPTS: parseInt(parsed.data.MAX_LOGIN_ATTEMPTS, 10),
    ACCOUNT_LOCK_DURATION_SECONDS: parseInt(parsed.data.ACCOUNT_LOCK_DURATION_SECONDS, 10),
    ACCOUNT_LOCK_DURATION_MINUTES: parseInt(parsed.data.ACCOUNT_LOCK_DURATION_MINUTES, 10),
    TWILIO_ENABLED: parsed.data.TWILIO_ENABLED === 'true',
    EMAIL_ENABLED: parsed.data.EMAIL_ENABLED === 'true',
    SMTP_PORT: parseInt(parsed.data.SMTP_PORT, 10),
    SMTP_SECURE: parsed.data.SMTP_SECURE === 'true',
    ALLOWED_ORIGINS: parsed.data.ALLOWED_ORIGINS.split(',').map(o => o.trim()),
    ALLOWED_FILE_TYPES: parsed.data.ALLOWED_FILE_TYPES.split(',').map(t => t.trim()),
    REDIS_ENABLED: parsed.data.REDIS_ENABLED === 'true',
};

export type Env = typeof env;
