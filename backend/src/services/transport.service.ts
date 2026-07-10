import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import crypto from 'crypto';
import cache from './cache.service';
import { NotificationService } from './notification.service';
import axios from 'axios';

// State tracker for simulated bus movement
const busState: Record<string, { stopIdx: number; progress: number }> = {};

// ── QR helpers ─────────────────────────────────────────────────────────────
function signQrPayload(payload: object): string {
    const secret = process.env.QR_SECRET || 'charronix-qr-secret-change-me-in-prod';
    const json = JSON.stringify(payload);
    const sig = crypto.createHmac('sha256', secret).update(json).digest('hex');
    return Buffer.from(JSON.stringify({ payload, sig })).toString('base64');
}

function verifyQrPayload(qrData: string): { payload: any; valid: boolean } {
    try {
        const secret = process.env.QR_SECRET || 'charronix-qr-secret-change-me-in-prod';
        const decoded = JSON.parse(Buffer.from(qrData, 'base64').toString('utf8'));
        const { payload, sig } = decoded;
        const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
        return { payload, valid: crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) };
    } catch {
        return { payload: null, valid: false };
    }
}

// ── TextBee SMS helper ─────────────────────────────────────────────────────
async function sendTextBeeSms(phones: string[], message: string) {
    const apiKey = process.env.TEXTBEE_API_KEY;
    const deviceId = process.env.TEXTBEE_DEVICE_ID;
    if (!apiKey || !deviceId) return;
    try {
        await axios.post(
            `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`,
            { recipients: phones, message },
            { headers: { 'x-api-key': apiKey } }
        );
    } catch (err: any) {
        console.error('TextBee SMS error:', err?.message);
    }
}

export class TransportService {
    // ── VEHICLES ─────────────────────────────────────────────────
    async getAllVehicles() {
        return prisma.vehicle.findMany({
            include: {
                driver: true,
                routes: { select: { id: true, name: true } },
            },
            orderBy: { registrationNo: 'asc' },
        });
    }

    async createVehicle(data: any) {
        return prisma.vehicle.create({
            data: {
                registrationNo: data.registrationNo,
                type: data.type,
                capacity: data.capacity,
                manufacturer: data.manufacturer,
                model: data.model,
                year: data.year,
                insuranceNo: data.insuranceNo,
                insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
                permitExpiry: data.permitExpiry ? new Date(data.permitExpiry) : undefined,
                fitnessExpiry: data.fitnessExpiry ? new Date(data.fitnessExpiry) : undefined,
                gpsDeviceId: data.gpsDeviceId,
                fuelType: data.fuelType,
                odometerReading: data.odometerReading || 0,
                lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate) : undefined,
                status: data.status || 'ACTIVE',
                driverId: data.driverId,
            },
            include: { driver: true },
        });
    }

    async updateVehicle(id: string, data: any) {
        const vehicle = await prisma.vehicle.findUnique({ where: { id } });
        if (!vehicle) throw new NotFoundError('Vehicle');

        return prisma.vehicle.update({
            where: { id },
            data: {
                ...(data.registrationNo && { registrationNo: data.registrationNo }),
                ...(data.type && { type: data.type }),
                ...(data.capacity && { capacity: data.capacity }),
                ...(data.manufacturer !== undefined && { manufacturer: data.manufacturer }),
                ...(data.model !== undefined && { model: data.model }),
                ...(data.year !== undefined && { year: data.year }),
                ...(data.insuranceNo !== undefined && { insuranceNo: data.insuranceNo }),
                ...(data.insuranceExpiry && { insuranceExpiry: new Date(data.insuranceExpiry) }),
                ...(data.permitExpiry && { permitExpiry: new Date(data.permitExpiry) }),
                ...(data.fitnessExpiry && { fitnessExpiry: new Date(data.fitnessExpiry) }),
                ...(data.gpsDeviceId !== undefined && { gpsDeviceId: data.gpsDeviceId }),
                ...(data.fuelType && { fuelType: data.fuelType }),
                ...(data.odometerReading !== undefined && { odometerReading: data.odometerReading }),
                ...(data.lastServiceDate && { lastServiceDate: new Date(data.lastServiceDate) }),
                ...(data.status && { status: data.status }),
                ...(data.driverId !== undefined && { driverId: data.driverId }),
            },
            include: { driver: true },
        });
    }

    async deleteVehicle(id: string) {
        const vehicle = await prisma.vehicle.findUnique({ where: { id } });
        if (!vehicle) throw new NotFoundError('Vehicle');
        return prisma.vehicle.delete({ where: { id } });
    }

    // ── DRIVERS ──────────────────────────────────────────────────
    async getAllDrivers() {
        return prisma.driver.findMany({
            include: {
                vehicles: { select: { id: true, registrationNo: true } },
            },
            orderBy: { name: 'asc' },
        });
    }

    async createDriver(data: any) {
        return prisma.driver.create({
            data: {
                name: data.name,
                phone: data.phone,
                licenseNo: data.licenseNo,
                licenseExpiry: new Date(data.licenseExpiry),
                medicalExpiry: new Date(data.medicalExpiry),
                policeVerified: data.policeVerified || false,
                photoUrl: data.photoUrl,
            },
        });
    }

    // ── ROUTES ───────────────────────────────────────────────────
    async getAllRoutes() {
        return prisma.route.findMany({
            include: {
                vehicle: { include: { driver: true } },
                stops: { orderBy: { sequence: 'asc' } },
                studentTransports: {
                    include: {
                        student: { select: { id: true, firstName: true, lastName: true, class: true, section: true, admissionNo: true } },
                        stop: { select: { stopName: true } },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async createRoute(data: any) {
        return prisma.route.create({
            data: {
                name: data.name,
                vehicleId: data.vehicleId,
                stops: data.stops ? {
                    create: data.stops.map((s: any, i: number) => ({
                        stopName: s.stopName,
                        landmark: s.landmark,
                        latitude: s.latitude,
                        longitude: s.longitude,
                        sequence: s.sequence || i + 1,
                        morningArrival: s.morningArrival,
                        eveningArrival: s.eveningArrival,
                    })),
                } : undefined,
            },
            include: {
                vehicle: { include: { driver: true } },
                stops: { orderBy: { sequence: 'asc' } },
            },
        });
    }

    async updateRoute(id: string, data: any) {
        const route = await prisma.route.findUnique({ where: { id } });
        if (!route) throw new NotFoundError('Route');

        return prisma.route.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.vehicleId !== undefined && { vehicleId: data.vehicleId }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
            include: {
                vehicle: { include: { driver: true } },
                stops: { orderBy: { sequence: 'asc' } },
            },
        });
    }

    async deleteRoute(id: string) {
        const route = await prisma.route.findUnique({ where: { id } });
        if (!route) throw new NotFoundError('Route');
        return prisma.route.delete({ where: { id } });
    }

    // ── STUDENT ASSIGNMENT ───────────────────────────────────────
    async assignStudentToRoute(studentId: string, routeId: string, stopId: string, feeAmount: number = 0, pickupType: string = 'BOTH') {
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) throw new NotFoundError('Student');

        const qrCode = `ST-${studentId.substring(0, 8)}-${Date.now()}`;

        return prisma.studentTransport.upsert({
            where: { studentId },
            update: { routeId, stopId, qrCode, feeAmount, pickupType: pickupType as any },
            create: { studentId, routeId, stopId, qrCode, feeAmount, pickupType: pickupType as any },
            include: {
                student: { select: { firstName: true, lastName: true, class: true, section: true } },
                route: { select: { name: true } },
                stop: { select: { stopName: true } },
            },
        });
    }

    async removeStudentFromRoute(studentId: string) {
        const assignment = await prisma.studentTransport.findUnique({ where: { studentId } });
        if (!assignment) throw new NotFoundError('Transport assignment');
        return prisma.studentTransport.delete({ where: { studentId } });
    }

    // ── BOARDING LOGS ────────────────────────────────────────────
    async getBoardingLogs(filters?: { date?: string; vehicleId?: string; limit?: number }) {
        const where: any = {};
        if (filters?.vehicleId) where.vehicleId = filters.vehicleId;
        if (filters?.date) {
            const d = new Date(filters.date);
            const nextDay = new Date(d);
            nextDay.setDate(nextDay.getDate() + 1);
            where.timestamp = { gte: d, lt: nextDay };
        }

        return prisma.boardingLog.findMany({
            where,
            include: {
                student: { select: { id: true, firstName: true, lastName: true, class: true, section: true, admissionNo: true } },
                vehicle: { select: { id: true, registrationNo: true } },
                stop: { select: { stopName: true } },
            },
            orderBy: { timestamp: 'desc' },
            take: filters?.limit || 100,
        });
    }

    async logBoarding(data: { studentId: string; vehicleId: string; stopId?: string; type: string; scanMethod?: string }) {
        const assignment = await prisma.studentTransport.findUnique({
            where: { studentId: data.studentId },
            include: { route: { include: { vehicle: true } } },
        });

        return prisma.boardingLog.create({
            data: {
                studentId: data.studentId,
                vehicleId: data.vehicleId || assignment?.route?.vehicle?.id || '',
                stopId: data.stopId || assignment?.stopId,
                type: data.type as any,
                scanMethod: (data.scanMethod || 'MANUAL') as any,
            },
            include: {
                student: { select: { firstName: true, lastName: true, class: true, section: true } },
                vehicle: { select: { registrationNo: true } },
                stop: { select: { stopName: true } },
            },
        });
    }

    // ── DASHBOARD STATS ──────────────────────────────────────────
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [totalVehicles, activeVehicles, totalRoutes, totalStudentsTransport, totalDrivers, todayBoardings, recentBoardings] = await Promise.all([
            prisma.vehicle.count(),
            prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
            prisma.route.count({ where: { isActive: true } }),
            prisma.studentTransport.count(),
            prisma.driver.count(),
            prisma.boardingLog.count({ where: { timestamp: { gte: today, lt: tomorrow } } }),
            prisma.boardingLog.findMany({
                where: { timestamp: { gte: today, lt: tomorrow } },
                include: {
                    student: { select: { firstName: true, lastName: true, class: true, section: true } },
                    vehicle: { select: { registrationNo: true } },
                    stop: { select: { stopName: true } },
                },
                orderBy: { timestamp: 'desc' },
                take: 20,
            }),
        ]);

        return { totalVehicles, activeVehicles, totalRoutes, totalStudentsTransport, totalDrivers, todayBoardings, recentBoardings };
    }

    // ── STUDENT TRANSPORT (for parent portal) ────────────────────
    async getStudentTransport(studentId: string) {
        const transport = await prisma.studentTransport.findUnique({
            where: { studentId },
            include: {
                route: { include: { vehicle: { include: { driver: true } }, stops: { orderBy: { sequence: 'asc' } } } },
                stop: true,
                student: { select: { firstName: true, lastName: true, class: true, section: true } },
            },
        });

        if (!transport) return null;

        const recentBoarding = await prisma.boardingLog.findMany({
            where: { studentId },
            include: {
                vehicle: { select: { registrationNo: true } },
                stop: { select: { stopName: true } },
            },
            orderBy: { timestamp: 'desc' },
            take: 10,
        });

        return { ...transport, recentBoarding };
    }

    // ── LIVE TRACKING (simulated) ───────────────────────────────
    async getVehiclePositions() {
        const vehicles = await prisma.vehicle.findMany({
            include: { driver: true, routes: { include: { stops: { orderBy: { sequence: 'asc' } } } } },
        });

        return vehicles.map(v => {
            const activeRoute = v.routes[0];
            const stops = activeRoute?.stops ?? [];
            if (!busState[v.id]) busState[v.id] = { stopIdx: 0, progress: 0 };
            const s = busState[v.id];

            s.progress += 0.04;
            if (s.progress >= 1) { s.progress = 0; s.stopIdx = (s.stopIdx + 1) % Math.max(stops.length, 1); }

            const from = stops[s.stopIdx];
            const to = stops[(s.stopIdx + 1) % stops.length] ?? stops[0];

            return {
                id: v.id,
                registrationNo: v.registrationNo,
                driverName: v.driver?.name ?? 'Unassigned',
                routeName: activeRoute?.name ?? 'No route',
                lat: from && to ? (from.latitude ?? 0) + ((to.latitude ?? 0) - (from.latitude ?? 0)) * s.progress : 12.9716,
                lng: from && to ? (from.longitude ?? 0) + ((to.longitude ?? 0) - (from.longitude ?? 0)) * s.progress : 77.5946,
                speed: Math.floor(20 + Math.random() * 25),
            };
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // P3 NEW ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    // ── 1. QR GENERATE ───────────────────────────────────────────
    async generateQR(studentId: string, type: 'BOARDING' | 'DEBOARDING' = 'BOARDING') {
        const transport = await prisma.studentTransport.findUnique({
            where: { studentId },
            include: {
                route: { include: { vehicle: true } },
                stop: true,
                student: { select: { firstName: true, lastName: true } },
            },
        });

        if (!transport) throw new Error('NO_TRANSPORT');

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

        const qrPayload = {
            studentId,
            busId: transport.route?.vehicleId ?? '',
            routeId: transport.routeId,
            stopId: transport.stopId,
            type,
            generatedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            nonce: crypto.randomUUID(),
        };

        const qrData = signQrPayload(qrPayload);

        return {
            qrData,
            expiresAt: expiresAt.toISOString(),
            studentName: `${transport.student?.firstName} ${transport.student?.lastName}`,
            busName: transport.route?.vehicle?.registrationNo ?? 'Unknown Bus',
            stopName: transport.stop?.stopName ?? 'Unknown Stop',
            type,
        };
    }

    // ── 2. QR SCAN ────────────────────────────────────────────────
    async scanQR(qrData: string, currentBusId: string, currentStopId: string) {
        // Step 1 & 2 — decode + verify signature
        const { payload, valid } = verifyQrPayload(qrData);
        if (!payload || !valid) {
            return { ok: false, code: 401, message: 'Invalid QR — security check failed' };
        }

        // Step 3 — expiry check
        if (new Date(payload.expiresAt) < new Date()) {
            return { ok: false, code: 400, message: 'QR code expired. Generate a new one.' };
        }

        // Step 4 — bus match
        if (payload.busId && payload.busId !== currentBusId) {
            const assignedBus = await prisma.vehicle.findUnique({
                where: { id: payload.busId },
                select: { registrationNo: true },
            });
            return { ok: false, code: 400, message: `Wrong bus! This student is assigned to ${assignedBus?.registrationNo ?? 'another bus'}.` };
        }

        // Step 5 — duplicate boarding check (same day)
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

        const existingLog = await prisma.boardingLog.findFirst({
            where: { studentId: payload.studentId, type: 'BOARDING', timestamp: { gte: today, lt: tomorrow } },
        });
        if (existingLog) {
            const time = existingLog.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            return { ok: false, code: 400, message: `Already boarded today at ${time}` };
        }

        // Step 6 — all checks passed: create boarding log
        const student = await prisma.student.findUnique({
            where: { id: payload.studentId },
            select: { id: true, firstName: true, lastName: true, class: true, section: true, rollNo: true, photoUrl: true, userId: true },
        });
        if (!student) return { ok: false, code: 404, message: 'Student not found' };

        const stop = await prisma.routeStop.findUnique({ where: { id: currentStopId }, select: { stopName: true } });

        const log = await prisma.boardingLog.create({
            data: {
                studentId: payload.studentId,
                vehicleId: currentBusId,
                stopId: currentStopId || undefined,
                type: payload.type as any,
                scanMethod: 'QR_CODE',
            },
        });

        // Notify parent if student has a linked user
        if (student.userId) {
            const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            await NotificationService.send({
                userId: student.userId,
                title: '🚌 Bus Boarding Confirmed',
                message: `${student.firstName} boarded the bus at ${stop?.stopName ?? 'stop'} at ${now}`,
                category: 'GENERAL',
                senderUserId: 'SYSTEM',
                senderName: 'Charronix Transport',
                senderRole: 'SYSTEM',
                iconEmoji: '🚌',
            });
        }

        return {
            ok: true,
            message: `✅ ${student.firstName} ${student.lastName} boarded successfully!`,
            studentName: `${student.firstName} ${student.lastName}`,
            studentPhoto: student.photoUrl,
            className: `${student.class}-${student.section}`,
            rollNo: student.rollNo,
            boardingLogId: log.id,
            timestamp: log.timestamp,
        };
    }

    // ── 3. GPS UPDATE (called by GPS device) ──────────────────────
    async updateGPS(busId: string, latitude: number, longitude: number, speed: number, deviceId: string) {
        // Persist to DB
        await (prisma as any).gPSLog.create({ data: { busId, latitude, longitude, speed, deviceId } });

        // Cache in Redis with 60s TTL
        const cacheKey = `bus:position:${busId}`;
        await cache.set(cacheKey, { lat: latitude, lng: longitude, speed, updatedAt: new Date().toISOString() }, 60);

        // Speed violation alert (school zone limit = 40 km/h)
        if (speed > 40) {
            const vehicle = await prisma.vehicle.findUnique({ where: { id: busId }, select: { registrationNo: true } });
            const admins = await prisma.user.findMany({
                where: { role: { in: ['ADMIN', 'PRINCIPAL'] }, isActive: true },
                select: { id: true },
            });
            if (admins.length > 0) {
                await (prisma.notification as any).createMany({
                    data: admins.map(a => ({
                        userId: a.id,
                        title: '⚠️ Speed Violation Alert',
                        message: `Bus ${vehicle?.registrationNo ?? busId} is travelling at ${speed} km/h (limit: 40 km/h)`,
                        type: 'WARNING',
                        category: 'GENERAL',
                        priority: 'HIGH',
                        senderUserId: 'SYSTEM',
                        senderName: 'Charronix GPS',
                        senderRole: 'SYSTEM',
                        iconEmoji: '⚠️',
                    })),
                });
            }
        }

        return { received: true };
    }

    // ── 4. LIVE BUS LOCATION (Redis-first) ───────────────────────
    async getLiveBusLocation(busId: string) {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: busId },
            include: { routes: { include: { stops: { orderBy: { sequence: 'asc' } } } } },
        });
        if (!vehicle) throw new NotFoundError('Vehicle');

        // Try Redis first
        const cached = await cache.get<any>(`bus:position:${busId}`);
        let position = cached;

        // Fallback to DB
        if (!position) {
            const lastLog = await (prisma as any).gPSLog.findFirst({
                where: { busId },
                orderBy: { timestamp: 'desc' },
            });
            if (lastLog) {
                position = { lat: lastLog.latitude, lng: lastLog.longitude, speed: lastLog.speed, updatedAt: lastLog.timestamp };
            }
        }

        const activeRoute = vehicle.routes[0];

        return {
            busId,
            busName: vehicle.registrationNo,
            latitude: position?.lat ?? null,
            longitude: position?.lng ?? null,
            speed: position?.speed ?? null,
            lastUpdated: position?.updatedAt ?? null,
            isLive: !!cached,
            route: activeRoute ? {
                id: activeRoute.id,
                name: activeRoute.name,
                stops: activeRoute.stops.map(s => ({
                    name: s.stopName,
                    lat: s.latitude,
                    lng: s.longitude,
                    sequence: s.sequence,
                    morningArrival: s.morningArrival,
                    eveningArrival: s.eveningArrival,
                })),
            } : null,
        };
    }

    // ── 5. SOS EMERGENCY ─────────────────────────────────────────
    async triggerSOS(busId: string, driverUserId: string, emergencyType: string, message?: string) {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: busId },
            include: { driver: true },
        });
        if (!vehicle) throw new NotFoundError('Vehicle');

        // Get GPS position (Redis or DB)
        const position = await cache.get<any>(`bus:position:${busId}`);

        // Count students onboard today
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        const studentCount = await prisma.boardingLog.count({
            where: { vehicleId: busId, type: 'BOARDING', timestamp: { gte: today, lt: tomorrow } },
        });

        const driverName = vehicle.driver?.name ?? 'Unknown Driver';
        const locationStr = position ? `${position.lat?.toFixed(4)},${position.lng?.toFixed(4)}` : 'Location unavailable';
        const now = new Date().toLocaleString('en-IN');

        const notifTitle = `🚨 EMERGENCY — Bus ${vehicle.registrationNo} needs help!`;
        const notifBody = `Type: ${emergencyType} | Driver: ${driverName} | Students onboard: ${studentCount} | Location: ${locationStr} | Time: ${now}${message ? ` | Note: ${message}` : ''}`;

        // Send to all admins and principals
        const admins = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'PRINCIPAL'] }, isActive: true },
            select: { id: true },
        });

        let alertsSent = 0;
        if (admins.length > 0) {
            await (prisma.notification as any).createMany({
                data: admins.map(a => ({
                    userId: a.id,
                    title: notifTitle,
                    message: notifBody,
                    type: 'ERROR',
                    category: 'GENERAL',
                    priority: 'URGENT',
                    senderUserId: driverUserId,
                    senderName: driverName,
                    senderRole: 'DRIVER',
                    iconEmoji: '🚨',
                })),
            });
            alertsSent = admins.length;
        }

        // SMS via TextBee to all admin phone numbers
        const adminPhones = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'PRINCIPAL'] }, isActive: true },
            select: { loginId: true },
        });
        const phones = adminPhones.map(u => u.loginId).filter(Boolean) as string[];
        if (phones.length > 0) {
            await sendTextBeeSms(phones, `🚨 CHARRONIX SOS: Bus ${vehicle.registrationNo} | ${emergencyType} | Driver: ${driverName} | Students: ${studentCount} | Location: ${locationStr}`);
        }

        // Audit log
        await (prisma.auditLog as any).create({
            data: {
                userId: driverUserId,
                action: 'SOS_TRIGGERED',
                entity: 'Vehicle',
                entityId: busId,
                details: { emergencyType, message, location: locationStr, studentCount },
            },
        });

        return {
            acknowledged: true,
            alertsSent,
            message: 'Help is on the way. Stay safe.',
        };
    }
}

export default new TransportService();
