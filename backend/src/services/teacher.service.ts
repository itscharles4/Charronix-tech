import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { parsePaginationParams, getPrismaSkipTake, buildPaginationMeta } from '../utils/pagination';

export class TeacherService {
    async list(query: any) {
        const { page, limit } = parsePaginationParams(query.page, query.limit);
        const { search, status } = query;

        const where: any = {};
        if (status && status !== 'ALL') where.status = status;
        else if (!status) where.status = 'ACTIVE';
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { employeeId: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.teacher.findMany({
                where,
                ...getPrismaSkipTake(page, limit),
                orderBy: { firstName: 'asc' },
                include: { subjects: true, classes: true },
            }),
            prisma.teacher.count({ where }),
        ]);

        return { data, pagination: buildPaginationMeta(page, limit, total) };
    }

    async getById(id: string) {
        const teacher = await prisma.teacher.findUnique({
            where: { id },
            include: { subjects: true, classes: true },
        });
        if (!teacher) throw new NotFoundError('Teacher');
        return teacher;
    }

    async create(data: any) {
        const existing = await prisma.teacher.findUnique({ where: { employeeId: data.employeeId } });
        if (existing) throw new ConflictError(`Employee ID ${data.employeeId} already exists`);

        const { subjects = [], classes = [], ...teacherData } = data;

        return prisma.teacher.create({
            data: {
                ...teacherData,
                dateOfJoining: teacherData.dateOfJoining ? new Date(teacherData.dateOfJoining) : undefined,
                subjects: { create: subjects.map((s: string) => ({ subject: s })) },
                classes: { create: classes.map((c: string) => ({ classSection: c })) },
            },
            include: { subjects: true, classes: true },
        });
    }

    async update(id: string, data: any) {
        const teacher = await prisma.teacher.findUnique({ where: { id } });
        if (!teacher) throw new NotFoundError('Teacher');

        const { subjects, classes, ...teacherData } = data;

        if (subjects !== undefined) {
            await prisma.teacherSubject.deleteMany({ where: { teacherId: id } });
            if (subjects.length > 0) {
                await prisma.teacherSubject.createMany({
                    data: subjects.map((s: string) => ({ teacherId: id, subject: s })),
                });
            }
        }

        if (classes !== undefined) {
            await prisma.teacherClass.deleteMany({ where: { teacherId: id } });
            if (classes.length > 0) {
                await prisma.teacherClass.createMany({
                    data: classes.map((c: string) => ({ teacherId: id, classSection: c })),
                });
            }
        }

        return prisma.teacher.update({
            where: { id },
            data: teacherData,
            include: { subjects: true, classes: true },
        });
    }

    async delete(id: string) {
        const teacher = await prisma.teacher.findUnique({ where: { id } });
        if (!teacher) throw new NotFoundError('Teacher');
        await prisma.teacher.delete({ where: { id } });
    }
}

export default new TeacherService();
