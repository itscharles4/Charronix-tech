import { z } from 'zod';

export const createTeacherSchema = z.object({
    body: z.object({
        employeeId: z.string().min(1).max(20),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
        email: z.string().email().optional(),
        qualification: z.string().max(200).optional(),
        dateOfJoining: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
        isClassTeacherOf: z.string().max(10).optional(),
        subjects: z.array(z.string()).optional(),
        classes: z.array(z.string()).optional(),
    }),
});

export const updateTeacherSchema = z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        phone: z.string().regex(/^\d{10}$/).optional(),
        email: z.string().email().optional(),
        qualification: z.string().max(200).optional(),
        isClassTeacherOf: z.string().max(10).optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
        subjects: z.array(z.string()).optional(),
        classes: z.array(z.string()).optional(),
    }),
});

export const listTeachersSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        search: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).optional(),
    }),
});
