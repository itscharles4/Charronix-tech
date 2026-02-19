import { z } from 'zod';

export const markAttendanceSchema = z.object({
    body: z.object({
        date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
        classSection: z.string().min(1),
        records: z.array(z.object({
            studentId: z.string().uuid(),
            status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEAVE']),
            remarks: z.string().optional(),
        })).min(1, 'At least one attendance record required'),
    }),
});

export const updateAttendanceSchema = z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEAVE']),
        remarks: z.string().optional(),
    }),
});

export const listAttendanceSchema = z.object({
    query: z.object({
        date: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        class: z.string().optional(),
        section: z.string().optional(),
        studentId: z.string().uuid().optional(),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEAVE']).optional(),
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
    }),
});
