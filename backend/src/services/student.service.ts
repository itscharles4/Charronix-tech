import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { parsePaginationParams, getPrismaSkipTake, buildPaginationMeta } from '../utils/pagination';
import cache from './cache.service';

export class StudentService {
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
                parentPhone: data.parentPhone,
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

        const updated = await prisma.student.update({
            where: { id },
            data: {
                ...data,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
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
