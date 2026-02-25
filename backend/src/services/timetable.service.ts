import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';

export class TimetableService {
    async getForStudent(userId: string) {
        // Get student's class and section
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { class: true, section: true }
        });

        if (!student) throw new NotFoundError('Student profile');

        // Fetch timetable for that class-section or ALL (for breaks/common events)
        const entries = await prisma.timetable.findMany({
            where: {
                OR: [
                    { class: student.class, section: student.section },
                    { class: 'ALL' }
                ]
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { period: 'asc' }
            ]
        });

        return entries;
    }
}

export default new TimetableService();
