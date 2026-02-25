import prisma from '../config/database';

export class NotificationService {

    static async getUserNotifications(
        userId: string,
        filters?: { category?: string; isRead?: boolean; limit?: number; offset?: number; }
    ) {
        const { category, isRead, limit = 50, offset = 0 } = filters || {};

        const where: any = { userId };
        if (category && category !== 'ALL') where.category = category;
        if (isRead !== undefined) where.isRead = isRead;

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
            take: limit,
            skip: offset,
        });

        return { success: true, data: notifications };
    }

    static async getUnreadCount(userId: string) {
        const count = await prisma.notification.count({ where: { userId, isRead: false } });
        return { success: true, data: { count } };
    }

    static async markAsRead(notificationId: string, userId: string) {
        await (prisma.notification as any).updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
        return { success: true, message: 'Notification marked as read' };
    }

    static async markAllAsRead(userId: string) {
        await (prisma.notification as any).updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { success: true, message: 'All notifications marked as read' };
    }

    static async sendToAllStudents(data: {
        senderUserId: string; senderName: string; senderRole: string;
        title: string; message: string; category: string; priority?: string; iconEmoji?: string;
    }) {
        const students = await prisma.student.findMany({
            where: { status: 'ACTIVE', userId: { not: null } },
            select: { userId: true },
        });

        if (students.length === 0) {
            return { success: false, message: 'No active students with accounts found' };
        }

        const notifData = students.map(s => ({
            userId: s.userId!,
            title: data.title,
            message: data.message,
            type: 'INFO',
            category: data.category || 'GENERAL',
            priority: data.priority || 'NORMAL',
            senderUserId: data.senderUserId,
            senderName: data.senderName,
            senderRole: data.senderRole,
            iconEmoji: data.iconEmoji || null,
        }));

        await (prisma.notification as any).createMany({ data: notifData });

        return {
            success: true,
            message: `Notification sent to ${students.length} students`,
            data: { recipientCount: students.length },
        };
    }

    static async sendToSpecificStudent(data: {
        senderUserId: string; senderName: string; senderRole: string;
        targetStudentId: string; title: string; message: string;
        category: string; priority?: string; iconEmoji?: string;
    }) {
        const student = await prisma.student.findUnique({
            where: { id: data.targetStudentId },
            select: { userId: true, firstName: true, lastName: true },
        });

        if (!student || !student.userId) {
            throw new Error('Student not found or has no linked account');
        }

        await (prisma.notification as any).create({
            data: {
                userId: student.userId,
                title: data.title,
                message: data.message,
                type: 'INFO',
                category: data.category || 'GENERAL',
                priority: data.priority || 'NORMAL',
                senderUserId: data.senderUserId,
                senderName: data.senderName,
                senderRole: data.senderRole,
                iconEmoji: data.iconEmoji || null,
            },
        });

        return {
            success: true,
            message: `Notification sent to ${student.firstName} ${student.lastName}`,
        };
    }

    static async deleteNotification(notificationId: string, userId: string) {
        await (prisma.notification as any).deleteMany({ where: { id: notificationId, userId } });
        return { success: true, message: 'Notification deleted' };
    }

    // ── Sent History — returns notifications authored by this user ──
    static async getSentNotifications(senderUserId: string, limit = 50, offset = 0) {
        const notifications = await (prisma.notification as any).findMany({
            where: { senderUserId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            distinct: ['title', 'message', 'createdAt'],  // deduplicate bulk sends
        });
        return { success: true, data: notifications };
    }

    // ── Send to ALL teachers ──
    static async sendToAllTeachers(data: {
        senderUserId: string; senderName: string; senderRole: string;
        title: string; message: string; category: string; priority?: string; iconEmoji?: string;
    }) {
        const teachers = await prisma.teacher.findMany({
            where: { userId: { not: null } },
            select: { userId: true },
        });

        if (teachers.length === 0) {
            return { success: false, message: 'No teachers with accounts found' };
        }

        const notifData = teachers.map(t => ({
            userId: t.userId!,
            title: data.title,
            message: data.message,
            type: 'INFO',
            category: data.category || 'GENERAL',
            priority: data.priority || 'NORMAL',
            senderUserId: data.senderUserId,
            senderName: data.senderName,
            senderRole: data.senderRole,
            iconEmoji: data.iconEmoji || null,
        }));

        await (prisma.notification as any).createMany({ data: notifData });

        return {
            success: true,
            message: `Notification sent to ${teachers.length} teachers`,
            data: { recipientCount: teachers.length },
        };
    }

    // ── Send to a specific teacher ──
    static async sendToSpecificTeacher(data: {
        senderUserId: string; senderName: string; senderRole: string;
        targetTeacherId: string; title: string; message: string;
        category: string; priority?: string; iconEmoji?: string;
    }) {
        const teacher = await prisma.teacher.findUnique({
            where: { id: data.targetTeacherId },
            select: { userId: true, firstName: true, lastName: true },
        });

        if (!teacher || !teacher.userId) {
            throw new Error('Teacher not found or has no linked account');
        }

        await (prisma.notification as any).create({
            data: {
                userId: teacher.userId,
                title: data.title,
                message: data.message,
                type: 'INFO',
                category: data.category || 'GENERAL',
                priority: data.priority || 'NORMAL',
                senderUserId: data.senderUserId,
                senderName: data.senderName,
                senderRole: data.senderRole,
                iconEmoji: data.iconEmoji || null,
            },
        });

        return {
            success: true,
            message: `Notification sent to ${teacher.firstName} ${teacher.lastName}`,
        };
    }
}
