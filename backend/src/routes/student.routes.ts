import { Router } from 'express';
import studentController from '../controllers/student.controller';
import { authenticate } from '../middleware/auth';
import { requireTeacherOrAbove, requireAdminOrPrincipal } from '../middleware/role';
import { validate } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema, listStudentsSchema } from '../validators/student.validator';

const router = Router();
router.use(authenticate);

router.get('/', validate(listStudentsSchema), studentController.list);
router.get('/stats', studentController.getStats);
router.get('/defaulters', studentController.getDefaulters);
router.get('/:id', studentController.getById);
router.post('/', requireTeacherOrAbove, validate(createStudentSchema), studentController.create);
router.put('/:id', requireTeacherOrAbove, validate(updateStudentSchema), studentController.update);
router.delete('/:id', requireAdminOrPrincipal, studentController.delete);

export default router;
