import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.error(`${req.method} ${req.path} - ${err.message}`, {
        stack: err.stack,
        body: req.body,
    });

    if (err instanceof ValidationError) {
        res.status(422).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Prisma errors
    if ((err as any).code === 'P2002') {
        res.status(409).json({
            success: false,
            message: 'A record with this value already exists',
        });
        return;
    }

    if ((err as any).code === 'P2025') {
        res.status(404).json({
            success: false,
            message: 'Record not found',
        });
        return;
    }

    // Generic 500
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
};

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
};
