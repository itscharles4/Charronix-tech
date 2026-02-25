import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import timetableService from '../services/timetable.service';
import { sendSuccess } from '../utils/apiResponse';

export class TimetableController {
    async getMyTimetable(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const timetable = await timetableService.getForStudent(userId);
            sendSuccess(res, timetable, 'Timetable fetched successfully');
        } catch (err) {
            next(err);
        }
    }
}

export default new TimetableController();
