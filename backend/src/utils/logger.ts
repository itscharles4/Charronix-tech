import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = process.env.LOG_FILE ? path.dirname(process.env.LOG_FILE) : './logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
        }),
        new winston.transports.File({
            filename: process.env.LOG_FILE || './logs/app.log',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            tailable: true,
        }),
        new winston.transports.File({
            filename: './logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 3,
        }),
    ],
});

export default logger;
