import { Router } from 'express';
import attendanceService from '../services/attendance.service';
import { authenticate } from '../middleware/auth';
import { requireTeacherOrAbove } from '../middleware/role';
import { validate } from '../middleware/validate';
import { markAttendanceSchema, listAttendanceSchema, updateAttendanceSchema } from '../validators/attendance.validator';
import { sendSuccess } from '../utils/apiResponse';
import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', validate(listAttendanceSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await attendanceService.list(req.query);
        sendSuccess(res, result.data, 'Attendance retrieved', 200, { pagination: result.pagination });
    } catch (err) { next(err); }
});

router.get('/defaulters', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 75;
        const students = await attendanceService.getDefaulters(threshold);
        sendSuccess(res, students);
    } catch (err) { next(err); }
});

router.get('/calendar', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentId, year, month } = req.query as any;
        const records = await attendanceService.getCalendar(studentId, parseInt(year), parseInt(month));
        sendSuccess(res, records);
    } catch (err) { next(err); }
});

router.get('/trends', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 30;
        const trends = await attendanceService.getTrends(days);
        sendSuccess(res, trends);
    } catch (err) { next(err); }
});

router.post('/mark', requireTeacherOrAbove, validate(markAttendanceSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const results = await attendanceService.markBulk(req.body, req.user?.userId);
        sendSuccess(res, results, `Attendance marked for ${results.length} students`);
    } catch (err) { next(err); }
});

router.put('/:id', requireTeacherOrAbove, validate(updateAttendanceSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const record = await attendanceService.update(req.params.id, req.body);
        sendSuccess(res, record, 'Attendance updated');
    } catch (err) { next(err); }
});

router.delete('/:id', requireTeacherOrAbove, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await attendanceService.delete(req.params.id);
        sendSuccess(res, null, 'Attendance record deleted');
    } catch (err) { next(err); }
});

export default router;
