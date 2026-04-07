import { Router } from 'express';
import transportController from '../controllers/transport.controller';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/role';
import { Role } from '../generated/client';

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

export default router;
