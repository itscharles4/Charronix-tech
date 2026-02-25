import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';

export class ParentService {
    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                profilePhotoUrl: true,
            },
        });

        if (!user) throw new NotFoundError('User');

        // Find students linked to this parent's email
        const children = await prisma.student.findMany({
            where: {
                parentEmail: user.email,
            },
            include: {
                academicGrades: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                attendance: {
                    orderBy: { date: 'desc' },
                    take: 30, // Last month's records
                },
                complaints: {
                    orderBy: { date: 'desc' },
                },
                achievements: {
                    orderBy: { date: 'desc' },
                },
                medicalInfo: true,
            },
        });

        return {
            user,
            children,
        };
    }

    async getChildStats(userId: string, studentId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundError('Parent');

        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                parentEmail: user.email,
            },
            include: {
                attendance: {
                    orderBy: { date: 'desc' },
                },
                academicGrades: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!student) throw new NotFoundError('Student not found for this guardian');

        return student;
    }
}

export default new ParentService();
