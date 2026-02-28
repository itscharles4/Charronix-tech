import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create assignment (teacher) - with file upload
router.post(
    '/',
    upload.single('attachment'),
    AssignmentController.createAssignment
);

// Get teacher's assignments
router.get('/teacher', AssignmentController.getTeacherAssignments);

// Get student's assignments
router.get('/student', AssignmentController.getStudentAssignments);

// Submit assignment (student) - with file upload
router.post(
    '/submit/:submissionId',
    upload.single('attachment'),
    AssignmentController.submitAssignment
);

// Get assignment submissions (teacher)
router.get('/:assignmentId/submissions', AssignmentController.getAssignmentSubmissions);

// Grade submission (teacher)
router.put('/grade/:submissionId', AssignmentController.gradeSubmission);

// Delete assignment (teacher)
router.delete('/:assignmentId', AssignmentController.deleteAssignment);

export default router;
