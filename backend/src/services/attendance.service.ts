import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { parsePaginationParams, getPrismaSkipTake, buildPaginationMeta } from '../utils/pagination';

export class AttendanceService {
    async markBulk(data: any, markedById?: string) {
        const { date, records } = data;
        const attendanceDate = new Date(date);

        const results = await Promise.all(
            records.map(async (record: any) => {
                return prisma.attendance.upsert({
                    where: {
                        studentId_date: {
                            studentId: record.studentId,
                            date: attendanceDate,
                        },
                    },
                    update: {
                        status: record.status,
                        remarks: record.remarks,
                        markedById,
                    },
                    create: {
                        studentId: record.studentId,
                        date: attendanceDate,
                        status: record.status,
                        remarks: record.remarks,
                        markedById,
                    },
                });
            })
        );

        // Update student attendance stats
        await this.updateStudentAttendanceStats(records.map((r: any) => r.studentId));

        return results;
    }

    private async updateStudentAttendanceStats(studentIds: string[]) {
        for (const studentId of studentIds) {
            const [total, present] = await Promise.all([
                prisma.attendance.count({ where: { studentId } }),
                prisma.attendance.count({ where: { studentId, status: 'PRESENT' } }),
            ]);

            const percentage = total > 0 ? (present / total) * 100 : 100;

            await prisma.student.update({
                where: { id: studentId },
                data: {
                    totalPresent: present,
                    totalAbsent: total - present,
                    attendancePercentage: Math.round(percentage * 100) / 100,
                    lastAttendanceDate: new Date(),
                },
            });
        }
    }

    async list(query: any) {
        const { page, limit } = parsePaginationParams(query.page, query.limit);
        const where: any = {};

        if (query.studentId) where.studentId = query.studentId;
        if (query.status) where.status = query.status;
        if (query.date) where.date = new Date(query.date);
        if (query.startDate && query.endDate) {
            where.date = { gte: new Date(query.startDate), lte: new Date(query.endDate) };
        }
        if (query.class || query.section) {
            where.student = {};
            if (query.class) where.student.class = query.class;
            if (query.section) where.student.section = query.section;
        }

        const [data, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                ...getPrismaSkipTake(page, limit),
                orderBy: { date: 'desc' },
                include: {
                    student: {
                        select: { id: true, firstName: true, lastName: true, class: true, section: true, rollNo: true },
                    },
                },
            }),
            prisma.attendance.count({ where }),
        ]);

        return { data, pagination: buildPaginationMeta(page, limit, total) };
    }

    async update(id: string, data: any) {
        const record = await prisma.attendance.findUnique({ where: { id } });
        if (!record) throw new NotFoundError('Attendance record');

        const updated = await prisma.attendance.update({ where: { id }, data });
        await this.updateStudentAttendanceStats([record.studentId]);
        return updated;
    }

    async delete(id: string) {
        const record = await prisma.attendance.findUnique({ where: { id } });
        if (!record) throw new NotFoundError('Attendance record');
        await prisma.attendance.delete({ where: { id } });
        await this.updateStudentAttendanceStats([record.studentId]);
    }

    async getCalendar(studentId: string, year: number, month: number) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        return prisma.attendance.findMany({
            where: { studentId, date: { gte: start, lte: end } },
            orderBy: { date: 'asc' },
        });
    }

    async getDefaulters(threshold = 75) {
        return prisma.student.findMany({
            where: { status: 'ACTIVE', attendancePercentage: { lt: threshold } },
            orderBy: { attendancePercentage: 'asc' },
            select: {
                id: true, firstName: true, lastName: true, class: true, section: true,
                admissionNo: true, attendancePercentage: true, parentPhone: true, parentName: true,
            },
        });
    }

    async getTrends(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const records = await prisma.attendance.groupBy({
            by: ['date', 'status'],
            where: { date: { gte: since } },
            _count: { id: true },
            orderBy: { date: 'asc' },
        });

        return records;
    }
}

export default new AttendanceService();
