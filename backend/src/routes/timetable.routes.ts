import { Router } from 'express';
import timetableController from '../controllers/timetable.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/my-timetable', authenticate, timetableController.getMyTimetable);

export default router;
