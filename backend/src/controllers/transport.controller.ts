import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import transportService from '../services/transport.service';
import { sendSuccess } from '../utils/apiResponse';

export class TransportController {
    // ── VEHICLES ─────────────────────────────────────────────────
    async getVehicles(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.getAllVehicles();
            sendSuccess(res, data, 'Vehicles retrieved');
        } catch (err) { next(err); }
    }

    async createVehicle(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.createVehicle(req.body);
            sendSuccess(res, data, 'Vehicle created', 201);
        } catch (err) { next(err); }
    }

    async updateVehicle(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.updateVehicle(req.params.id, req.body);
            sendSuccess(res, data, 'Vehicle updated');
        } catch (err) { next(err); }
    }

    async deleteVehicle(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await transportService.deleteVehicle(req.params.id);
            sendSuccess(res, null, 'Vehicle deleted');
        } catch (err) { next(err); }
    }

    // ── DRIVERS ──────────────────────────────────────────────────
    async getDrivers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.getAllDrivers();
            sendSuccess(res, data, 'Drivers retrieved');
        } catch (err) { next(err); }
    }

    async createDriver(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.createDriver(req.body);
            sendSuccess(res, data, 'Driver created', 201);
        } catch (err) { next(err); }
    }

    // ── ROUTES ───────────────────────────────────────────────────
    async getRoutes(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.getAllRoutes();
            sendSuccess(res, data, 'Routes retrieved');
        } catch (err) { next(err); }
    }

    async createRoute(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.createRoute(req.body);
            sendSuccess(res, data, 'Route created', 201);
        } catch (err) { next(err); }
    }

    async updateRoute(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.updateRoute(req.params.id, req.body);
            sendSuccess(res, data, 'Route updated');
        } catch (err) { next(err); }
    }

    async deleteRoute(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await transportService.deleteRoute(req.params.id);
            sendSuccess(res, null, 'Route deleted');
        } catch (err) { next(err); }
    }

    // ── STUDENT ASSIGNMENT ───────────────────────────────────────
    async assignStudent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { studentId, routeId, stopId, feeAmount, pickupType } = req.body;
            const data = await transportService.assignStudentToRoute(studentId, routeId, stopId, feeAmount, pickupType);
            sendSuccess(res, data, 'Student assigned to route');
        } catch (err) { next(err); }
    }

    async unassignStudent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await transportService.removeStudentFromRoute(req.params.studentId);
            sendSuccess(res, null, 'Student removed from transport');
        } catch (err) { next(err); }
    }

    // ── BOARDING LOGS ────────────────────────────────────────────
    async getBoardingLogs(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { date, vehicleId, limit } = req.query;
            const data = await transportService.getBoardingLogs({
                date: date as string,
                vehicleId: vehicleId as string,
                limit: limit ? parseInt(limit as string) : undefined,
            });
            sendSuccess(res, data, 'Boarding logs retrieved');
        } catch (err) { next(err); }
    }

    async logBoarding(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.logBoarding(req.body);
            sendSuccess(res, data, 'Boarding logged', 201);
        } catch (err) { next(err); }
    }

    // ── DASHBOARD ────────────────────────────────────────────────
    async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.getDashboardStats();
            sendSuccess(res, data, 'Transport dashboard stats');
        } catch (err) { next(err); }
    }

    // ── LIVE TRACKING ────────────────────────────────────────────
    async getVehiclePositions(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.getVehiclePositions();
            sendSuccess(res, data, 'Vehicle positions retrieved');
        } catch (err) { next(err); }
    }

    // ── STUDENT TRANSPORT (parent view) ──────────────────────────
    async getStudentTransport(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await transportService.getStudentTransport(req.params.studentId);
            sendSuccess(res, data, 'Student transport details');
        } catch (err) { next(err); }
    }
}

export default new TransportController();
