import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';


export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const errors: Record<string, string[]> = {};
                err.errors.forEach((e) => {
                    const field = e.path.slice(1).join('.');
                    if (!errors[field]) errors[field] = [];
                    errors[field].push(e.message);
                });
                res.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors,
                });
                return;
            }
            next(err);
        }
    };
};
