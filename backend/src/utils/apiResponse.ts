import { Response } from 'express';

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    meta?: Record<string, unknown>;
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: Record<string, unknown>
): Response => {
    const response: ApiResponse<T> = { success: true, message, data };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully'): Response => {
    return sendSuccess(res, data, message, 201);
};

export const sendError = (
    res: Response,
    message: string,
    statusCode = 500,
    error?: string
): Response => {
    const response: ApiResponse = { success: false, message, error };
    return res.status(statusCode).json(response);
};

export const sendNotFound = (res: Response, entity = 'Resource'): Response => {
    return sendError(res, `${entity} not found`, 404);
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized'): Response => {
    return sendError(res, message, 401);
};

export const sendForbidden = (res: Response, message = 'Forbidden'): Response => {
    return sendError(res, message, 403);
};

export const sendBadRequest = (res: Response, message: string): Response => {
    return sendError(res, message, 400);
};
