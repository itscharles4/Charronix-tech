import { Router, Request, Response, NextFunction } from 'express';
import transportController from '../controllers/transport.controller';
import transportService from '../services/transport.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/role';
import { sendSuccess, sendError, sendBadRequest } from '../utils/apiResponse';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// ── DASHBOARD (Admin/Principal) ──────────────────────────────
router.get('/dashboard', requireRoles(Role.ADMIN, Role.PRINCIPAL), transportController.getDashboard);

// ── LIVE TRACKING ────────────────────────────────────────────
router.get('/positions', requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.PARENT), transportController.getVehiclePositions);

// ── VEHICLES ─────────────────────────────────────────────────
router.get('/vehicles', requireRoles(Role.ADMIN, Role.PRINCIPAL), transportController.getVehicles);
router.post('/vehicles', requireRoles(Role.ADMIN), transportController.createVehicle);
router.put('/vehicles/:id', requireRoles(Role.ADMIN), transportController.updateVehicle);
router.delete('/vehicles/:id', requireRoles(Role.ADMIN), transportController.deleteVehicle);

// ── DRIVERS ──────────────────────────────────────────────────
router.get('/drivers', requireRoles(Role.ADMIN, Role.PRINCIPAL), transportController.getDrivers);
router.post('/drivers', requireRoles(Role.ADMIN), transportController.createDriver);

// ── ROUTES ───────────────────────────────────────────────────
router.get('/routes', requireRoles(Role.ADMIN, Role.PRINCIPAL), transportController.getRoutes);
router.post('/routes', requireRoles(Role.ADMIN), transportController.createRoute);
router.put('/routes/:id', requireRoles(Role.ADMIN), transportController.updateRoute);
router.delete('/routes/:id', requireRoles(Role.ADMIN), transportController.deleteRoute);

// ── STUDENT ASSIGNMENT ───────────────────────────────────────
router.post('/assign-student', requireRoles(Role.ADMIN), transportController.assignStudent);
router.delete('/unassign-student/:studentId', requireRoles(Role.ADMIN), transportController.unassignStudent);

// ── BOARDING LOGS ────────────────────────────────────────────
router.get('/boarding-logs', requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER), transportController.getBoardingLogs);
router.post('/boarding-log', requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER), transportController.logBoarding);

// ── STUDENT TRANSPORT (for parent portal) ────────────────────
router.get('/student/:studentId', requireRoles(Role.ADMIN, Role.PARENT), transportController.getStudentTransport);

// ════════════════════════════════════════════════════════════════
// P3 NEW ENDPOINTS
// ════════════════════════════════════════════════════════════════

// ── 1. POST /transport/qr/generate ──────────────────────────
// Auth: student or parent (any authenticated user linked to a student)
router.post('/qr/generate', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { studentId, type } = req.body;

        if (!studentId) {
            return sendBadRequest(res, 'studentId is required');
        }
        const boardingType = (type === 'DEBOARDING' ? 'DEBOARDING' : 'BOARDING') as 'BOARDING' | 'DEBOARDING';

        const result = await transportService.generateQR(studentId, boardingType);
        return sendSuccess(res, result, 'QR code generated successfully');
    } catch (err: any) {
        if (err.message === 'NO_TRANSPORT') {
            return sendBadRequest(res, 'No transport assigned for this student. Please contact admin.');
        }
        next(err);
    }
});

// ── 2. POST /transport/qr/scan ───────────────────────────────
// Auth: ADMIN | PRINCIPAL | TEACHER (conductor role — use TEACHER for now, or add DRIVER later)
router.post('/qr/scan', requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { qrData, currentBusId, currentStopId } = req.body;

        if (!qrData || !currentBusId) {
            return sendBadRequest(res, 'qrData and currentBusId are required');
        }

        const result = await transportService.scanQR(qrData, currentBusId, currentStopId || '');

        if (!result.ok) {
            return sendError(res, result.message, result.code);
        }

        return sendSuccess(res, result, result.message);
    } catch (err) {
        next(err);
    }
});

// ── 3. POST /transport/gps/update ────────────────────────────
// Auth: GPS device API key (X-GPS-Device-Key header) — NO JWT
// NOTE: This route is mounted BEFORE router.use(authenticate) above,
// so we handle it as a standalone sub-router pattern by bypassing auth via header check.
// Since router.use(authenticate) already ran, we verify the GPS key inside the handler.
router.post('/gps/update', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deviceKey = req.headers['x-gps-device-key'];
        const expectedKey = process.env.GPS_DEVICE_SECRET;

        if (!expectedKey || deviceKey !== expectedKey) {
            return sendError(res, 'Invalid GPS device key', 401);
        }

        const { busId, latitude, longitude, speed, deviceId } = req.body;

        if (!busId || latitude === undefined || longitude === undefined) {
            return sendBadRequest(res, 'busId, latitude, and longitude are required');
        }

        const result = await transportService.updateGPS(
            busId,
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(speed ?? 0),
            deviceId ?? 'unknown'
        );

        return sendSuccess(res, result, 'GPS location received');
    } catch (err) {
        next(err);
    }
});

// ── 4. GET /transport/gps/bus/:busId ─────────────────────────
// Auth: JWT required (parent, teacher, admin, principal)
router.get('/gps/bus/:busId', requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.PARENT), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { busId } = req.params;
        const result = await transportService.getLiveBusLocation(busId);
        return sendSuccess(res, result, 'Live location retrieved');
    } catch (err) {
        next(err);
    }
});

// ── 5. POST /transport/sos ───────────────────────────────────
// Auth: ADMIN | TEACHER (conductor) — driver triggers from app
router.post('/sos', requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { busId, emergencyType, message } = req.body;

        if (!busId || !emergencyType) {
            return sendBadRequest(res, 'busId and emergencyType are required');
        }

        const validTypes = ['ACCIDENT', 'MEDICAL', 'BREAKDOWN', 'SECURITY'];
        if (!validTypes.includes(emergencyType)) {
            return sendBadRequest(res, `emergencyType must be one of: ${validTypes.join(', ')}`);
        }

        const result = await transportService.triggerSOS(
            busId,
            req.user!.userId,
            emergencyType,
            message
        );

        return sendSuccess(res, result, result.message);
    } catch (err) {
        next(err);
    }
});

export default router;
