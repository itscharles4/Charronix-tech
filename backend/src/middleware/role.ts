import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { sendForbidden } from '../utils/apiResponse';
import { Role } from '@prisma/client';

export const requireRoles = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            sendForbidden(res, 'Authentication required');
            return;
        }
        if (!roles.includes(req.user.role as Role)) {
            sendForbidden(res, `Access denied. Required roles: ${roles.join(', ')}`);
            return;
        }
        next();
    };
};

export const requireAdmin = requireRoles(Role.ADMIN);
export const requireAdminOrPrincipal = requireRoles(Role.ADMIN, Role.PRINCIPAL);
export const requireTeacherOrAbove = requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER);
export const requireAnyRole = requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.PARENT, Role.STUDENT);
