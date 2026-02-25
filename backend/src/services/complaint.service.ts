import prisma from '../config/database';
import { ComplaintSeverity, ComplaintStatus } from '@prisma/client';

class ComplaintService {

    /**
     * Teacher raises a complaint about a student
     */
    async create(data: {
        studentId: string;
        teacherId: string;
        severity: ComplaintSeverity;
        description: string;
    }) {
        // Verify student exists
        const student = await prisma.student.findUnique({
            where: { id: data.studentId },
        });
        if (!student) {
            throw Object.assign(new Error('Student not found'), { statusCode: 404 });
        }

        const complaint = await prisma.complaint.create({
            data: {
                studentId: data.studentId,
                teacherId: data.teacherId,
                severity: data.severity,
                description: data.description,
                date: new Date(),
                status: ComplaintStatus.OPEN,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        admissionNo: true,
                        class: true,
                        section: true,
                        rollNo: true,
                        parentName: true,
                        parentPhone: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                    },
                },
            },
        });

        return complaint;
    }

    /**
     * Get complaints for a specific student (used by Parent Portal)
     */
    async getByStudent(studentId: string) {
        return prisma.complaint.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            include: {
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                    },
                },
            },
        });
    }

    /**
     * Get complaints raised by a specific teacher
     */
    async getByTeacher(teacherId: string) {
        return prisma.complaint.findMany({
            where: { teacherId },
            orderBy: { createdAt: 'desc' },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        admissionNo: true,
                        class: true,
                        section: true,
                        rollNo: true,
                    },
                },
            },
        });
    }

    /**
     * Update complaint status (Admin/Teacher)
     */
    async updateStatus(complaintId: string, status: ComplaintStatus) {
        return prisma.complaint.update({
            where: { id: complaintId },
            data: { status },
        });
    }
}

export default new ComplaintService();
