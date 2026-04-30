import prisma from '../config/database'; // Prisma client instance
import { NotificationService } from './notification.service';
import { AssignmentStatus, SubmissionStatus } from '@prisma/client';

export class AssignmentService {

    /**
     * Teacher creates assignment
     */
    static async createAssignment(
        teacherId: string,
        data: {
            title: string;
            description: string;
            subject: string;
            class: string;
            section?: string;
            dueDate: Date;
            allowLateSubmission: boolean;
            maxMarks?: number;
        },
        file?: Express.Multer.File
    ) {
        try {
            let attachmentUrl = null;
            let attachmentName = null;
            let attachmentSize = null;

            if (file) {
                // For local storage, we just store the path or constructed URL
                // Assuming app.ts mounts /uploads
                attachmentUrl = `/uploads/assignments/${file.filename}`;
                attachmentName = file.originalname;
                attachmentSize = file.size;
            }

            // Create assignment
            const assignment = await prisma.assignment.create({
                data: {
                    teacherId,
                    title: data.title,
                    description: data.description,
                    subject: data.subject,
                    class: data.class,
                    section: data.section || null,
                    dueDate: data.dueDate,
                    allowLateSubmission: data.allowLateSubmission,
                    maxMarks: data.maxMarks,
                    attachmentUrl,
                    attachmentName,
                    attachmentSize,
                    status: 'ACTIVE',
                },
                include: {
                    teacher: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            // Get all students in this class/section
            const students = await prisma.student.findMany({
                where: {
                    class: data.class,
                    ...(data.section && { section: data.section }),
                    status: 'ACTIVE'
                },
                select: {
                    id: true,
                    userId: true,
                },
            });

            // Pre-create submission records for all students (status PENDING)
            const submissionData = students.map((student: { id: string }) => ({
                assignmentId: assignment.id,
                studentId: student.id,
                status: SubmissionStatus.PENDING,
            }));

            if (submissionData.length > 0) {
                await prisma.submission.createMany({ data: submissionData });
            }

            // Notify students
            const teacherName = assignment.teacher.user
                ? `${assignment.teacher.firstName} ${assignment.teacher.lastName}`.trim()
                : 'Teacher';

            const notificationPromises = students
                .filter((s: { userId: string | null }) => s.userId)
                .map((student: { userId: string | null }) =>
                    NotificationService.send({
                        userId: student.userId!,
                        title: `New Assignment: ${data.title}`,
                        message: `${teacherName} has uploaded a new ${data.subject} assignment. Due date: ${assignment.dueDate.toLocaleDateString('en-IN')}`,
                        category: 'ACADEMIC',
                        senderUserId: teacherId,
                        senderName: teacherName,
                        senderRole: 'TEACHER',
                    })
                );

            await Promise.all(notificationPromises);

            return {
                success: true,
                message: `Assignment created and assigned to ${students.length} students`,
                data: assignment,
            };
        } catch (error: any) {
            console.error('Error creating assignment:', error);
            throw new Error(error.message || 'Failed to create assignment');
        }
    }

    /**
     * Get teacher's assignments with submission summary
     */
    static async getTeacherAssignments(teacherId: string) {
        try {
            const assignments = await prisma.assignment.findMany({
                where: { teacherId },
                include: {
                    _count: {
                        select: { submissions: true },
                    },
                    submissions: {
                        where: {
                            status: { not: SubmissionStatus.PENDING },
                        },
                        select: { id: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return {
                success: true,
                data: assignments.map((a: any) => ({
                    ...a,
                    totalStudents: a._count.submissions,
                    submittedCount: a.submissions.length,
                    pendingCount: a._count.submissions - a.submissions.length,
                })),
            };
        } catch (error: any) {
            console.error('Error fetching teacher assignments:', error);
            throw new Error('Failed to fetch assignments');
        }
    }

    /**
     * Get student's assignments (actually fetching submisson records)
     */
    static async getStudentAssignments(studentId: string) {
        try {
            const submissions = await prisma.submission.findMany({
                where: { studentId },
                include: {
                    assignment: {
                        include: {
                            teacher: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    assignment: {
                        dueDate: 'asc',
                    },
                },
            });

            return {
                success: true,
                data: submissions.map((s: any) => ({
                    id: s.id,
                    status: s.status,
                    submittedAt: s.submittedAt,
                    marksObtained: s.marksObtained,
                    feedback: s.feedback,
                    attachmentUrl: s.attachmentUrl,
                    attachmentName: s.attachmentName,
                    isLate: s.isLate,
                    assignment: {
                        id: s.assignment.id,
                        title: s.assignment.title,
                        description: s.assignment.description,
                        subject: s.assignment.subject,
                        dueDate: s.assignment.dueDate,
                        maxMarks: s.assignment.maxMarks,
                        attachmentUrl: s.assignment.attachmentUrl,
                        attachmentName: s.assignment.attachmentName,
                        allowLateSubmission: s.assignment.allowLateSubmission,
                        teacher: {
                            firstName: s.assignment.teacher.firstName,
                            lastName: s.assignment.teacher.lastName,
                        },
                    },
                })),
            };
        } catch (error: any) {
            console.error('Error fetching student assignments:', error);
            throw new Error('Failed to fetch assignments');
        }
    }

    /**
     * Student submits assignment
     */
    static async submitAssignment(
        submissionId: string,
        studentId: string,
        file?: Express.Multer.File,
        remarks?: string
    ) {
        try {
            const submission = await prisma.submission.findUnique({
                where: { id: submissionId },
                include: {
                    assignment: true,
                    student: { include: { user: true } }
                },
            });

            if (!submission) throw new Error('Submission record not found');
            if (submission.studentId !== studentId) throw new Error('Unauthorized');
            if (!file) throw new Error('Please upload your solution file');

            const now = new Date();
            const isLate = now > new Date(submission.assignment.dueDate);

            if (isLate && !submission.assignment.allowLateSubmission) {
                throw new Error('Late submissions are not allowed for this assignment');
            }

            const updatedSubmission = await prisma.submission.update({
                where: { id: submissionId },
                data: {
                    attachmentUrl: `/uploads/submissions/${file.filename}`,
                    attachmentName: file.originalname,
                    attachmentSize: file.size,
                    status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
                    isLate,
                    submittedAt: now,
                    remarks,
                },
                include: {
                    assignment: true,
                    student: { include: { user: true } },
                },
            });

            // Notify teacher
            const teacher = await prisma.teacher.findUnique({
                where: { id: submission.assignment.teacherId },
                select: { userId: true }
            });

            if (teacher && teacher.userId) {
                await NotificationService.send({
                    userId: teacher.userId,
                    title: `New Submission: ${submission.assignment.title}`,
                    message: `${updatedSubmission.student.firstName} ${updatedSubmission.student.lastName} has submitted their work.`,
                    category: 'ACADEMIC',
                    senderUserId: updatedSubmission.student.userId!,
                    senderName: `${updatedSubmission.student.firstName} ${updatedSubmission.student.lastName}`,
                    senderRole: 'STUDENT',
                });
            }

            return {
                success: true,
                message: 'Assignment submitted successfully',
                data: updatedSubmission,
            };
        } catch (error: any) {
            console.error('Error submitting assignment:', error);
            throw new Error(error.message || 'Failed to submit assignment');
        }
    }

    /**
     * Get all submissions for a specific assignment (Teacher tool)
     */
    static async getAssignmentSubmissions(assignmentId: string, teacherId: string) {
        try {
            const assignment = await prisma.assignment.findFirst({
                where: { id: assignmentId, teacherId },
            });

            if (!assignment) throw new Error('Assignment not found or unauthorized');

            const submissions = await prisma.submission.findMany({
                where: { assignmentId },
                include: {
                    student: { include: { user: true } },
                },
                orderBy: [
                    { status: 'asc' },
                    { submittedAt: 'desc' },
                ],
            });

            return {
                success: true,
                data: {
                    assignment,
                    submissions: submissions.map((s: any) => ({
                        id: s.id,
                        studentId: s.studentId,
                        studentName: `${s.student.firstName} ${s.student.lastName}`,
                        admissionNo: s.student.admissionNo,
                        class: s.student.class,
                        section: s.student.section,
                        rollNo: s.student.rollNo,
                        status: s.status,
                        isLate: s.isLate,
                        submittedAt: s.submittedAt,
                        attachmentUrl: s.attachmentUrl,
                        attachmentName: s.attachmentName,
                        marksObtained: s.marksObtained,
                        feedback: s.feedback,
                        remarks: s.remarks,
                    })),
                },
            };
        } catch (error: any) {
            console.error('Error fetching submissions:', error);
            throw new Error(error.message || 'Failed to fetch submissions');
        }
    }

    /**
     * Teacher grades a submission
     */
    static async gradeSubmission(
        submissionId: string,
        teacherId: string,
        data: {
            marksObtained: number;
            feedback?: string;
        }
    ) {
        try {
            const submission = await prisma.submission.findUnique({
                where: { id: submissionId },
                include: {
                    assignment: true,
                    student: true
                },
            });

            if (!submission || submission.assignment.teacherId !== teacherId) {
                throw new Error('Submission not found or unauthorized');
            }

            const updatedSubmission = await prisma.submission.update({
                where: { id: submissionId },
                data: {
                    marksObtained: data.marksObtained,
                    feedback: data.feedback,
                    status: SubmissionStatus.GRADED,
                    gradedAt: new Date(),
                    gradedBy: teacherId,
                },
            });

            // Notify student
            if (submission.student.userId) {
                await NotificationService.send({
                    userId: submission.student.userId,
                    title: `Assignment Graded: ${submission.assignment.title}`,
                    message: `You scored ${data.marksObtained}/${submission.assignment.maxMarks || '-'} marks.`,
                    category: 'ACADEMIC',
                    senderUserId: teacherId,
                    senderName: 'Teacher',
                    senderRole: 'TEACHER',
                });
            }

            return {
                success: true,
                message: 'Submission graded successfully',
                data: updatedSubmission,
            };
        } catch (error: any) {
            console.error('Error grading submission:', error);
            throw new Error(error.message || 'Failed to grade submission');
        }
    }

    /**
     * Delete assignment
     */
    static async deleteAssignment(assignmentId: string, teacherId: string) {
        try {
            const assignment = await prisma.assignment.findFirst({
                where: { id: assignmentId, teacherId },
            });

            if (!assignment) throw new Error('Assignment not found');

            await prisma.assignment.delete({ where: { id: assignmentId } });

            return { success: true, message: 'Assignment deleted successfully' };
        } catch (error: any) {
            console.error('Error deleting assignment:', error);
            throw new Error(error.message || 'Failed to delete assignment');
        }
    }
}
