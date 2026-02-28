import { Request, Response } from 'express';
import { AssignmentService } from '../services/assignment.service';
import { AuthRequest } from '../middleware/auth';

export class AssignmentController {

    /**
     * Teacher creates assignment
     */
    static async createAssignment(req: AuthRequest, res: Response) {
        try {
            const teacherId = req.user?.teacherId;

            if (!teacherId || req.user?.role !== 'TEACHER') {
                return res.status(403).json({
                    success: false,
                    message: 'Only teachers can create assignments',
                });
            }

            const { title, description, subject, class: className, section, dueDate, allowLateSubmission, maxMarks } = req.body;

            if (!title || !description || !subject || !className || !dueDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields',
                });
            }

            const result = await AssignmentService.createAssignment(
                teacherId,
                {
                    title,
                    description,
                    subject,
                    class: className,
                    section: section || undefined,
                    dueDate: new Date(dueDate),
                    allowLateSubmission: allowLateSubmission === 'true' || allowLateSubmission === true,
                    maxMarks: maxMarks ? parseInt(maxMarks) : undefined,
                },
                req.file
            );

            return res.status(201).json(result);
        } catch (error: any) {
            console.error('Create assignment error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to create assignment',
            });
        }
    }

    /**
     * Get teacher's assignments
     */
    static async getTeacherAssignments(req: AuthRequest, res: Response) {
        try {
            const teacherId = req.user?.teacherId;

            if (!teacherId) {
                return res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
            }

            const result = await AssignmentService.getTeacherAssignments(teacherId);
            return res.json(result);
        } catch (error: any) {
            console.error('Get teacher assignments error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch assignments',
            });
        }
    }

    /**
     * Get student's assignments
     */
    static async getStudentAssignments(req: AuthRequest, res: Response) {
        try {
            const studentId = req.user?.studentId;

            if (!studentId) {
                return res.status(403).json({
                    success: false,
                    message: 'Student profile not found',
                });
            }

            const result = await AssignmentService.getStudentAssignments(studentId);
            return res.json(result);
        } catch (error: any) {
            console.error('Get student assignments error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch assignments',
            });
        }
    }

    /**
     * Student submits assignment
     */
    static async submitAssignment(req: AuthRequest, res: Response) {
        try {
            const { submissionId } = req.params;
            const studentId = req.user?.studentId;
            const { remarks } = req.body;

            if (!studentId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only students can submit assignments',
                });
            }

            const result = await AssignmentService.submitAssignment(
                submissionId,
                studentId,
                req.file,
                remarks
            );

            return res.json(result);
        } catch (error: any) {
            console.error('Submit assignment error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to submit assignment',
            });
        }
    }

    /**
     * Get assignment submissions (teacher)
     */
    static async getAssignmentSubmissions(req: AuthRequest, res: Response) {
        try {
            const { assignmentId } = req.params;
            const teacherId = req.user?.teacherId;

            if (!teacherId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access',
                });
            }

            const result = await AssignmentService.getAssignmentSubmissions(assignmentId, teacherId);
            return res.json(result);
        } catch (error: any) {
            console.error('Get submissions error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch submissions',
            });
        }
    }

    /**
     * Teacher grades submission
     */
    static async gradeSubmission(req: AuthRequest, res: Response) {
        try {
            const { submissionId } = req.params;
            const teacherId = req.user?.teacherId;
            const { marksObtained, feedback } = req.body;

            if (!teacherId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access',
                });
            }

            if (marksObtained === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Marks are required',
                });
            }

            const result = await AssignmentService.gradeSubmission(
                submissionId,
                teacherId,
                {
                    marksObtained: parseInt(marksObtained),
                    feedback,
                }
            );

            return res.json(result);
        } catch (error: any) {
            console.error('Grade submission error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to grade submission',
            });
        }
    }

    /**
     * Delete assignment
     */
    static async deleteAssignment(req: AuthRequest, res: Response) {
        try {
            const { assignmentId } = req.params;
            const teacherId = req.user?.teacherId;

            if (!teacherId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access',
                });
            }

            const result = await AssignmentService.deleteAssignment(assignmentId, teacherId);
            return res.json(result);
        } catch (error: any) {
            console.error('Delete assignment error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete assignment',
            });
        }
    }
}
