import { Router } from 'express';
import complaintController from '../controllers/complaint.controller';
import { authenticate } from '../middleware/auth';
import { requireTeacherOrAbove } from '../middleware/role';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Teacher raises a complaint
router.post('/', requireTeacherOrAbove, complaintController.create);

// Get complaints for a specific student (any authenticated user)
router.get('/student/:studentId', complaintController.getByStudent);

// Get complaints raised by the authenticated teacher
router.get('/my-raised', requireTeacherOrAbove, complaintController.getMyRaised);

// Update complaint status (Admin/Teacher)
router.patch('/:id/status', requireTeacherOrAbove, complaintController.updateStatus);

export default router;
