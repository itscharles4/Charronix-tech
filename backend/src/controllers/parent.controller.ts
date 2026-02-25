import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import parentService from '../services/parent.service';
import { sendSuccess } from '../utils/apiResponse';

export class ParentController {
    async getMe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return next(new Error('User not authenticated'));
            }
            const data = await parentService.getMe(userId);
            sendSuccess(res, data, 'Parent profile retrieved');
        } catch (err) {
            next(err);
        }
    }

    async getChildStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            const { studentId } = req.params;
            if (!userId) {
                return next(new Error('User not authenticated'));
            }
            const data = await parentService.getChildStats(userId, studentId);
            sendSuccess(res, data, 'Child statistics retrieved');
        } catch (err) {
            next(err);
        }
    }
}

export default new ParentController();
