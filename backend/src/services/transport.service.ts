import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';

// State tracker for simulated bus movement
const busState: Record<string, { stopIdx: number; progress: number }> = {};

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
                vehicle: {
                    include: { driver: true },
                },
                stops: { orderBy: { sequence: 'asc' } },
                studentTransports: {
                    include: {
                        student: {
                            select: { id: true, firstName: true, lastName: true, class: true, section: true, admissionNo: true },
                        },
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
        // Delete stops first (cascaded), then route
        return prisma.route.delete({ where: { id } });
    }

    // ── STUDENT ASSIGNMENT ───────────────────────────────────────
    async assignStudentToRoute(studentId: string, routeId: string, stopId: string, feeAmount: number = 0, pickupType: string = 'BOTH') {
        // Verify student exists
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) throw new NotFoundError('Student');

        // Auto-generate QR code
        const qrCode = `ST-${studentId.substring(0, 8)}-${Date.now()}`;

        return prisma.studentTransport.upsert({
            where: { studentId },
            update: {
                routeId,
                stopId,
                qrCode,
                feeAmount,
                pickupType: pickupType as any,
            },
            create: {
                studentId,
                routeId,
                stopId,
                qrCode,
                feeAmount,
                pickupType: pickupType as any,
            },
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
        // Verify student's transport assignment
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

        const [
            totalVehicles,
            activeVehicles,
            totalRoutes,
            totalStudentsTransport,
            totalDrivers,
            todayBoardings,
            recentBoardings,
        ] = await Promise.all([
            prisma.vehicle.count(),
            prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
            prisma.route.count({ where: { isActive: true } }),
            prisma.studentTransport.count(),
            prisma.driver.count(),
            prisma.boardingLog.count({
                where: { timestamp: { gte: today, lt: tomorrow } },
            }),
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

        return {
            totalVehicles,
            activeVehicles,
            totalRoutes,
            totalStudentsTransport,
            totalDrivers,
            todayBoardings,
            recentBoardings,
        };
    }

    // ── STUDENT TRANSPORT (for parent portal) ────────────────────
    async getStudentTransport(studentId: string) {
        const transport = await prisma.studentTransport.findUnique({
            where: { studentId },
            include: {
                route: {
                    include: {
                        vehicle: { include: { driver: true } },
                        stops: { orderBy: { sequence: 'asc' } },
                    },
                },
                stop: true,
                student: {
                    select: { firstName: true, lastName: true, class: true, section: true },
                },
            },
        });

        if (!transport) return null;

        // Get recent boarding logs for this student
        const recentBoarding = await prisma.boardingLog.findMany({
            where: { studentId },
            include: {
                vehicle: { select: { registrationNo: true } },
                stop: { select: { stopName: true } },
            },
            orderBy: { timestamp: 'desc' },
            take: 10,
        });

        return {
            ...transport,
            recentBoarding,
        };
    }

    // ── LIVE TRACKING ───────────────────────────────────────────
    async getVehiclePositions() {
        const vehicles = await prisma.vehicle.findMany({
            include: {
                driver: true,
                routes: { include: { stops: { orderBy: { sequence: 'asc' } } } }
            }
        });

        return vehicles.map(v => {
            const activeRoute = v.routes[0];
            const stops = activeRoute?.stops ?? [];
            if (!busState[v.id]) busState[v.id] = { stopIdx: 0, progress: 0 };
            const s = busState[v.id];

            // Advance progress to simulate movement
            s.progress += 0.04;
            if (s.progress >= 1) {
                s.progress = 0;
                s.stopIdx = (s.stopIdx + 1) % Math.max(stops.length, 1);
            }

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
}

export default new TransportService();
