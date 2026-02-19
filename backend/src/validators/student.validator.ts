import { z } from 'zod';

export const createStudentSchema = z.object({
    body: z.object({
        admissionNo: z.string().min(1).max(20),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        dateOfBirth: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
        class: z.string().min(1).max(10),
        section: z.string().min(1).max(5),
        rollNo: z.number().int().positive(),
        parentName: z.string().min(1).max(200),
        parentPhone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
        parentEmail: z.string().email().optional(),
        bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
        address: z.string().max(500).optional(),
    }),
});

export const updateStudentSchema = z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        class: z.string().min(1).max(10).optional(),
        section: z.string().min(1).max(5).optional(),
        rollNo: z.number().int().positive().optional(),
        parentPhone: z.string().regex(/^\d{10}$/).optional(),
        parentEmail: z.string().email().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
        address: z.string().max(500).optional(),
    }),
});

export const listStudentsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        class: z.string().optional(),
        section: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).optional(),
        search: z.string().optional(),
        sortBy: z.enum(['firstName', 'rollNo', 'admissionNo', 'createdAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
});
