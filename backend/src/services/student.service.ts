import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { parsePaginationParams, getPrismaSkipTake, buildPaginationMeta } from '../utils/pagination';
import cache from './cache.service';

export class StudentService {
    async getMe(userId: string) {
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                medicalInfo: true,
                achievements: { orderBy: { date: 'desc' } },
                academicGrades: {
                    where: { term: 'Term 1', academicYear: '2025-26' },
                    orderBy: { createdAt: 'desc' }
                },
            },
        });

        if (!student) throw new NotFoundError('Student profile');

        // ✅ Fetch attendance records for current month (February 2026) as requested
        const februaryStart = new Date('2026-02-01');
        const februaryEnd = new Date('2026-03-01');

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                studentId: student.id,
                date: {
                    gte: februaryStart,
                    lt: februaryEnd,
                },
            },
            orderBy: { date: 'asc' },
            include: {
                markedBy: true // This is the Teacher relation
            }
        });

        // ✅ Calculate attendance statistics
        const totalDays = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
        const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length;
        const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length;
        const leaveCount = attendanceRecords.filter(r => r.status === 'LEAVE').length;

        const attendancePercentage = totalDays > 0
            ? Math.round((presentCount / totalDays) * 100)
            : 0;

        // ✅ Fetch student-specific notifications
        // The user's review suggested 'studentId' in Notification model, 
        // but schema.prisma shows 'userId' relation. We use userId.
        const notifications = await prisma.notification.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        // ✅ Academic Stats
        const totalMarks = student.academicGrades.reduce((sum, g) => sum + Number(g.score), 0);
        const maxPossible = student.academicGrades.reduce((sum, g) => sum + Number(g.maxScore), 0);
        const avgPercentage = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;

        let avgGrade = 'N/A';
        if (avgPercentage >= 90) avgGrade = 'A+';
        else if (avgPercentage >= 80) avgGrade = 'A';
        else if (avgPercentage >= 70) avgGrade = 'B+';
        else if (avgPercentage >= 60) avgGrade = 'B';
        else if (avgPercentage >= 50) avgGrade = 'C+';
        else if (avgPercentage > 0) avgGrade = 'C';

        return {
            ...student,
            attendance: {
                percentage: attendancePercentage,
                totalDays,
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                leave: leaveCount,
                records: attendanceRecords.map(r => ({
                    id: r.id,
                    date: r.date,
                    status: r.status,
                    remarks: r.remarks,
                    markedBy: r.markedBy
                        ? `${r.markedBy.firstName} ${r.markedBy.lastName}`
                        : 'System',
                })),
            },
            notifications: notifications.map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                isRead: n.isRead,
                createdAt: n.createdAt,
            })),
            avgPercentage: Math.round(avgPercentage),
            avgGrade,
            grades: student.academicGrades.map(g => ({
                subject: g.subject,
                score: Number(g.score),
                maxScore: Number(g.maxScore),
                grade: g.grade,
                percentage: Math.round((Number(g.score) / Number(g.maxScore)) * 100)
            })),
            achievementCount: student.achievements.length,
            subjectCount: student.academicGrades.length
        };
    }

    async list(query: any) {
        const { page, limit } = parsePaginationParams(query.page, query.limit);
        const { class: cls, section, status, search, sortBy = 'firstName', sortOrder = 'asc' } = query;

        const where: any = {};
        if (cls) where.class = cls;
        if (section) where.section = section;
        if (status && status !== 'ALL') where.status = status;
        else if (!status) where.status = 'ACTIVE';
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { admissionNo: { contains: search, mode: 'insensitive' } },
                { parentPhone: { contains: search } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.student.findMany({
                where,
                ...getPrismaSkipTake(page, limit),
                orderBy: { [sortBy]: sortOrder },
                include: { medicalInfo: true },
            }),
            prisma.student.count({ where }),
        ]);

        return { data, pagination: buildPaginationMeta(page, limit, total) };
    }

    async getById(id: string) {
        const cached = await cache.get<any>(`student:${id}`);
        if (cached) return cached;

        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                medicalInfo: true,
                achievements: { orderBy: { date: 'desc' } },
                academicGrades: { orderBy: { createdAt: 'desc' } },
                communicationLogs: { orderBy: { date: 'desc' }, take: 10 },
                complaints: { orderBy: { date: 'desc' } },
            },
        });
        if (!student) throw new NotFoundError('Student');

        await cache.set(`student:${id}`, student, 300); // 5 min cache
        return student;
    }

    async create(data: any) {
        const existing = await prisma.student.findUnique({
            where: { admissionNo: data.admissionNo },
        });
        if (existing) throw new ConflictError(`Admission number ${data.admissionNo} already exists`);

        // Normalize phone number - remove all non-digits
        const phoneDigitsOnly = data.parentPhone.replace(/\D/g, '');

        const student = await prisma.student.create({
            data: {
                admissionNo: data.admissionNo,
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                gender: data.gender,
                class: data.class,
                section: data.section,
                rollNo: data.rollNo,
                parentName: data.parentName,
                parentPhone: phoneDigitsOnly,
                parentEmail: data.parentEmail,
                bloodGroup: data.bloodGroup,
                address: data.address,
            },
        });

        await cache.deletePattern('students:*');
        return student;
    }

    async update(id: string, data: any) {
        const student = await prisma.student.findUnique({ where: { id } });
        if (!student) throw new NotFoundError('Student');

        // Normalize phone number if provided - remove all non-digits
        const updateData = { ...data };
        if (updateData.parentPhone) {
            updateData.parentPhone = updateData.parentPhone.replace(/\D/g, '');
        }

        const updated = await prisma.student.update({
            where: { id },
            data: {
                ...updateData,
                dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
            },
        });

        await cache.delete(`student:${id}`);
        await cache.deletePattern('students:*');
        return updated;
    }

    async delete(id: string) {
        const student = await prisma.student.findUnique({ where: { id } });
        if (!student) throw new NotFoundError('Student');

        await prisma.student.delete({ where: { id } });
        await cache.delete(`student:${id}`);
        await cache.deletePattern('students:*');
    }

    async getStats() {
        const [total, active, classDistribution] = await Promise.all([
            prisma.student.count(),
            prisma.student.count({ where: { status: 'ACTIVE' } }),
            prisma.student.groupBy({
                by: ['class', 'section'],
                _count: { id: true },
                orderBy: [{ class: 'asc' }, { section: 'asc' }],
            }),
        ]);
        return { total, active, inactive: total - active, classDistribution };
    }

    async getDefaulters(threshold = 75) {
        return prisma.student.findMany({
            where: {
                status: 'ACTIVE',
                attendancePercentage: { lt: threshold },
            },
            orderBy: { attendancePercentage: 'asc' },
            select: {
                id: true, firstName: true, lastName: true,
                class: true, section: true, admissionNo: true,
                attendancePercentage: true, parentPhone: true, parentName: true,
            },
        });
    }
}

export default new StudentService();
