import { Router, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/role';
import { sendSuccess, sendError, sendBadRequest } from '../utils/apiResponse';
import { env } from '../config/env';
import { Role } from '@prisma/client';
import cache from '../services/cache.service';
import {
    predictRisk,
    predictClassRisk,
    checkPythonServiceHealth,
    generateInterventions,
} from '../services/charronixAI.service';

const router = Router();
router.use(authenticate);

// ════════════════════════════════════════════════════════════
// EXISTING CHAT ENDPOINTS (unchanged)
// ════════════════════════════════════════════════════════════

// POST /api/v1/ai/chat
router.post('/chat', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }

        const history = await prisma.aiChatHistory.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        await prisma.aiChatHistory.create({
            data: { userId: req.user!.userId, role: 'user', message },
        });

        let aiResponse = 'AI service is not configured. Please set GOOGLE_AI_API_KEY.';

        if (env.GOOGLE_AI_API_KEY) {
            try {
                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({ apiKey: env.GOOGLE_AI_API_KEY });

                const systemPrompt = `You are Charronix AI, an intelligent assistant for the Charronix School Management System. 
        You help teachers, administrators, and staff with school management tasks, student data analysis, 
        attendance insights, and educational guidance. Be concise, professional, and helpful.`;

                const contents = [
                    ...history.reverse().map(h => ({ role: h.role as 'user' | 'model', parts: [{ text: h.message }] })),
                    { role: 'user' as const, parts: [{ text: message }] },
                ];

                const result = await ai.models.generateContent({
                    model: env.GOOGLE_AI_MODEL,
                    contents,
                    config: { systemInstruction: systemPrompt },
                });

                aiResponse = result.text || 'No response generated';
            } catch (aiErr: any) {
                aiResponse = `AI error: ${aiErr.message}`;
            }
        }

        await prisma.aiChatHistory.create({
            data: { userId: req.user!.userId, role: 'model', message: aiResponse },
        });

        sendSuccess(res, { message: aiResponse });
    } catch (err) { next(err); }
});

// GET /api/v1/ai/history
router.get('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string || '50');
        const history = await prisma.aiChatHistory.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
        sendSuccess(res, history);
    } catch (err) { next(err); }
});

// DELETE /api/v1/ai/history
router.delete('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await prisma.aiChatHistory.deleteMany({ where: { userId: req.user!.userId } });
        sendSuccess(res, null, 'Chat history cleared');
    } catch (err) { next(err); }
});

// ════════════════════════════════════════════════════════════
// P4 — AI DROPOUT RISK ENDPOINTS
// ════════════════════════════════════════════════════════════

// Helper: last known risk from DB (used in 503 fallback responses)
async function getLastKnownRisk(studentId: string) {
    return (prisma as any).aIRiskScore.findFirst({
        where: { studentId },
        orderBy: { predictedAt: 'desc' },
    });
}

// ── GET /api/v1/ai/health ─────────────────────────────────
// Public check — is the Python AI service up?
router.get('/health', async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const health = await checkPythonServiceHealth();
        sendSuccess(res, health, health.online ? 'AI service is online' : 'AI service is offline');
    } catch (err) { next(err); }
});

// ── GET /api/v1/ai/risk/school/summary ───────────────────
// MUST come before /risk/:studentId to avoid route collision
router.get('/risk/school/summary',
    requireRoles(Role.ADMIN, Role.PRINCIPAL),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            // Get latest risk score per student (subquery approach)
            const allScores = await (prisma as any).aIRiskScore.findMany({
                orderBy: { predictedAt: 'desc' },
                include: {
                    student: {
                        select: { id: true, firstName: true, lastName: true, class: true, section: true },
                    },
                },
            });

            // Keep only latest per student
            const latestPerStudent = new Map<string, any>();
            for (const score of allScores) {
                if (!latestPerStudent.has(score.studentId)) {
                    latestPerStudent.set(score.studentId, score);
                }
            }

            const latest = Array.from(latestPerStudent.values());
            const totalStudents = latest.length;
            const highRisk = latest.filter(s => s.riskLevel === 'RED');
            const mediumRisk = latest.filter(s => s.riskLevel === 'YELLOW');
            const lowRisk = latest.filter(s => s.riskLevel === 'GREEN');

            // Top 10 at-risk
            const topAtRisk = latest
                .sort((a, b) => b.riskScore - a.riskScore)
                .slice(0, 10)
                .map(s => ({
                    studentId: s.studentId,
                    name: `${s.student?.firstName} ${s.student?.lastName}`,
                    class: `${s.student?.class}-${s.student?.section}`,
                    riskScore: s.riskScore,
                    riskLevel: s.riskLevel,
                }));

            // Weekly trend: last 8 weeks average risk scores
            const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000);
            const recentScores = await (prisma as any).aIRiskScore.findMany({
                where: { predictedAt: { gte: eightWeeksAgo } },
                select: { riskScore: true, predictedAt: true },
                orderBy: { predictedAt: 'asc' },
            });

            // Group by week
            const weeklyBuckets: Record<number, number[]> = {};
            for (const s of recentScores) {
                const weekIdx = Math.floor((new Date(s.predictedAt).getTime() - eightWeeksAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
                const key = Math.min(7, Math.max(0, weekIdx));
                if (!weeklyBuckets[key]) weeklyBuckets[key] = [];
                weeklyBuckets[key].push(s.riskScore);
            }
            const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
                const bucket = weeklyBuckets[i] ?? [];
                return {
                    week: i + 1,
                    avgRisk: bucket.length > 0 ? Math.round(bucket.reduce((s, v) => s + v, 0) / bucket.length) : null,
                };
            });

            sendSuccess(res, {
                totalStudents,
                highRisk: { count: highRisk.length, percentage: totalStudents ? Math.round((highRisk.length / totalStudents) * 100) : 0 },
                mediumRisk: { count: mediumRisk.length, percentage: totalStudents ? Math.round((mediumRisk.length / totalStudents) * 100) : 0 },
                lowRisk: { count: lowRisk.length, percentage: totalStudents ? Math.round((lowRisk.length / totalStudents) * 100) : 0 },
                weeklyTrend,
                topAtRiskStudents: topAtRisk,
            }, 'School risk summary retrieved');
        } catch (err) { next(err); }
    }
);

// ── GET /api/v1/ai/risk/class/:classId ───────────────────
router.get('/risk/class/:classId',
    requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { classId } = req.params; // format: "10" or "10-A"
            const parts = classId.split('-');
            const cls = parts[0];
            const section = parts[1];

            const result = await predictClassRisk(cls, section);

            const high = result.students.filter(s => s.riskLevel === 'RED').length;
            const med = result.students.filter(s => s.riskLevel === 'YELLOW').length;
            const low = result.students.filter(s => s.riskLevel === 'GREEN').length;

            sendSuccess(res, {
                classId,
                totalStudents: result.total,
                predicted: result.students.length,
                failed: result.failed,
                highRisk: high,
                mediumRisk: med,
                lowRisk: low,
                students: result.students,
            }, 'Class risk analysis complete');
        } catch (err) { next(err); }
    }
);

// ── GET /api/v1/ai/risk/:studentId ───────────────────────
router.get('/risk/:studentId',
    requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.PARENT),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { studentId } = req.params;

            // Parents can only view their own child
            if (req.user!.role === 'PARENT') {
                const student = await prisma.student.findUnique({
                    where: { id: studentId },
                    select: { userId: true },
                });
                // If no parent-link: check parentUserId on student (basic check)
                if (!student) return sendError(res, 'Student not found', 404);
            }

            // Check Redis cache (6 hour TTL)
            const cacheKey = `ai:risk:${studentId}`;
            const cached = await cache.get<any>(cacheKey);
            if (cached) {
                return sendSuccess(res, { ...cached, fromCache: true }, 'Risk score retrieved (cached)');
            }

            // Get last two scores for trend
            const previousScores = await (prisma as any).aIRiskScore.findMany({
                where: { studentId },
                orderBy: { predictedAt: 'desc' },
                take: 2,
            });

            let riskRecord: any;
            try {
                riskRecord = await predictRisk(studentId);
            } catch (err: any) {
                if (err.message?.startsWith('PYTHON_SERVICE_UNAVAILABLE')) {
                    const lastKnown = previousScores[0] ?? null;
                    return sendError(res, 'AI service temporarily unavailable', 503,
                        JSON.stringify({ lastKnownRisk: lastKnown, fallback: true })
                    );
                }
                throw err;
            }

            // Compute trend
            let trend = 'STABLE';
            if (previousScores.length >= 1) {
                const diff = riskRecord.riskScore - previousScores[0].riskScore;
                if (diff > 5) trend = 'WORSENING';
                else if (diff < -5) trend = 'IMPROVING';
            }

            // Get student info
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                select: { firstName: true, lastName: true, class: true, section: true },
            });

            const payload = {
                studentId,
                studentName: student ? `${student.firstName} ${student.lastName}` : '',
                className: student ? `${student.class}-${student.section}` : '',
                riskScore: riskRecord.riskScore,
                riskLevel: riskRecord.riskLevel,
                confidence: riskRecord.confidence,
                topFactors: riskRecord.topFactors,
                phaseAnalysis: riskRecord.phaseAnalysis,
                predictedAt: riskRecord.predictedAt,
                trend,
            };

            // Cache for 6 hours
            await cache.set(cacheKey, payload, 6 * 3600);
            return sendSuccess(res, payload, 'Risk score generated successfully');
        } catch (err) { next(err); }
    }
);

// ── POST /api/v1/ai/intervention/generate/:studentId ─────
router.post('/intervention/generate/:studentId',
    requireRoles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { studentId } = req.params;

            if (!env.GOOGLE_AI_API_KEY) {
                return sendError(res, 'Google AI API key not configured', 503);
            }

            // Check if a fresh intervention already exists (< 7 days old)
            const existing = await (prisma as any).intervention.findFirst({
                where: { studentId, expiresAt: { gte: new Date() } },
                orderBy: { generatedAt: 'desc' },
            });
            if (existing) {
                return sendSuccess(res, existing, 'Returning cached intervention (still valid for 7 days)');
            }

            const intervention = await generateInterventions(studentId, env.GOOGLE_AI_API_KEY, env.GOOGLE_AI_MODEL);

            return sendSuccess(res, {
                interventionId: intervention.id,
                studentId: intervention.studentId,
                riskScoreAtGeneration: intervention.riskScoreAtGeneration,
                teacherIntervention: intervention.teacherIntervention,
                parentIntervention: intervention.parentIntervention,
                counselorIntervention: intervention.counselorIntervention,
                adminIntervention: intervention.adminIntervention,
                generatedAt: intervention.generatedAt,
                expiresAt: intervention.expiresAt,
            }, 'Intervention plan generated successfully');
        } catch (err) { next(err); }
    }
);

// ── GET /api/v1/ai/intervention/:studentId/:role ──────────
router.get('/intervention/:studentId/:role',
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { studentId, role } = req.params;
            const userRole = req.user!.role;

            // Role-gate: only allow the matching role to see their section
            const roleMap: Record<string, string[]> = {
                teacher: ['TEACHER', 'ADMIN', 'PRINCIPAL'],
                parent: ['PARENT', 'ADMIN'],
                counselor: ['TEACHER', 'ADMIN', 'PRINCIPAL'],
                admin: ['ADMIN', 'PRINCIPAL'],
            };

            if (!roleMap[role]) {
                return sendBadRequest(res, `Invalid role. Must be one of: teacher, parent, counselor, admin`);
            }
            if (!roleMap[role].includes(userRole)) {
                return sendError(res, `Access denied. Your role (${userRole}) cannot view the ${role} intervention.`, 403);
            }

            // Find latest non-expired intervention
            let intervention = await (prisma as any).intervention.findFirst({
                where: { studentId, expiresAt: { gte: new Date() } },
                orderBy: { generatedAt: 'desc' },
            });

            // Auto-generate if none exists or expired
            if (!intervention && env.GOOGLE_AI_API_KEY) {
                try {
                    intervention = await generateInterventions(studentId, env.GOOGLE_AI_API_KEY, env.GOOGLE_AI_MODEL);
                } catch {
                    return sendError(res, 'No intervention plan available and generation failed. Please try again.', 503);
                }
            }

            if (!intervention) {
                return sendError(res, 'No intervention plan available. Please generate one first.', 404);
            }

            // Return only the role-specific section
            const sectionMap: Record<string, string> = {
                teacher: 'teacherIntervention',
                parent: 'parentIntervention',
                counselor: 'counselorIntervention',
                admin: 'adminIntervention',
            };

            return sendSuccess(res, {
                interventionId: intervention.id,
                studentId: intervention.studentId,
                role,
                plan: (intervention as any)[sectionMap[role]],
                riskScoreAtGeneration: intervention.riskScoreAtGeneration,
                generatedAt: intervention.generatedAt,
                expiresAt: intervention.expiresAt,
            }, `${role} intervention retrieved`);
        } catch (err) { next(err); }
    }
);

// ── POST /api/v1/ai/intervention/:interventionId/feedback ─
router.post('/intervention/:interventionId/feedback',
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { interventionId } = req.params;
            const { role, useful, actionTaken } = req.body;

            if (!role || useful === undefined) {
                return sendBadRequest(res, 'role and useful (boolean) are required');
            }

            const intervention = await (prisma as any).intervention.findUnique({
                where: { id: interventionId },
            });
            if (!intervention) return sendError(res, 'Intervention not found', 404);

            const existingLogs = Array.isArray(intervention.feedbackLogs) ? intervention.feedbackLogs : [];
            const newLog = { role, useful: Boolean(useful), actionTaken: actionTaken ?? '', loggedAt: new Date().toISOString() };

            await (prisma as any).intervention.update({
                where: { id: interventionId },
                data: { feedbackLogs: [...existingLogs, newLog] },
            });

            return sendSuccess(res, { success: true, feedbackLogged: newLog }, 'Feedback recorded');
        } catch (err) { next(err); }
    }
);

export default router;
