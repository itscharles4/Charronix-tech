/**
 * charronixAI.service.ts
 * Bridges the TypeScript backend to the Python FastAPI dropout-prediction microservice.
 * Handles: data assembly from Prisma → Python API call → result persistence → Gemini interventions.
 */

import axios from 'axios';
import prisma from '../config/database';

const PYTHON_AI_URL = process.env.CHARRONIX_AI_URL || 'http://localhost:8001';
const PYTHON_TIMEOUT_MS = 15_000;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeekData {
    attendance_pct: number;
    avg_grade: number;
    assignment_submission_rate: number;
    parent_portal_logins: number;
    behavioral_incidents: number;
    transport_delay_days: number;
    health_absence_days: number;
}

export interface PythonPredictResponse {
    student_id: string;
    risk_score: number;           // 0-100
    risk_level: 'GREEN' | 'YELLOW' | 'RED';
    confidence: number;
    top_factors: Array<{ factor: string; magnitude: number; description: string }>;
    phase_analysis?: {
        dominant_phase: number;
        phase1_weight: number;
        phase2_weight: number;
        phase3_weight: number;
        attention_scores?: number[];
    };
    model_version?: string;
}

// ─── Helper: build 16 weeks of student data from Prisma ───────────────────────

async function getStudentWeeklyData(studentId: string): Promise<WeekData[]> {
    const now = new Date();
    const weeksData: WeekData[] = [];

    // Fetch raw data for last 16 weeks in parallel
    const sixteenWeeksAgo = new Date(now.getTime() - 16 * 7 * 24 * 60 * 60 * 1000);

    const [attendanceRecords, gradeRecords, submissionRecords, complaintRecords, boardingRecords] = await Promise.all([
        // Attendance
        prisma.attendance.findMany({
            where: { studentId, date: { gte: sixteenWeeksAgo } },
            select: { date: true, status: true },
            orderBy: { date: 'asc' },
        }),
        // Grades
        prisma.academicGrade.findMany({
            where: { studentId },
            select: { score: true, maxScore: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        }),
        // Assignment submissions
        (prisma as any).submission.findMany({
            where: { studentId, createdAt: { gte: sixteenWeeksAgo } },
            select: { status: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        }),
        // Behavioral incidents (Complaint table)
        prisma.complaint.findMany({
            where: { studentId, createdAt: { gte: sixteenWeeksAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        }),
        // Transport: boarding logs (LATE / missing)
        prisma.boardingLog.findMany({
            where: { studentId, timestamp: { gte: sixteenWeeksAgo } },
            select: { timestamp: true, type: true },
            orderBy: { timestamp: 'asc' },
        }),
    ]);

    // Compute overall averages as fallback for empty weeks
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const avgAttendance = totalDays > 0 ? (presentDays / totalDays) * 100 : 85;

    const gradeAvg = gradeRecords.length > 0
        ? gradeRecords.reduce((sum, g) => sum + (Number(g.score) / Number(g.maxScore)) * 100, 0) / gradeRecords.length
        : 70;

    // Helper: get ISO week number (0-indexed from 16 weeks ago)
    const getWeekIndex = (date: Date): number => {
        const diff = date.getTime() - sixteenWeeksAgo.getTime();
        return Math.min(15, Math.max(0, Math.floor(diff / (7 * 24 * 60 * 60 * 1000))));
    };

    // Aggregate per-week
    const weekBuckets: Record<number, {
        present: number; total: number;
        gradeSum: number; gradeCount: number;
        submittedCount: number; totalAssignments: number;
        incidents: number; transportDelays: number; healthAbsences: number;
    }> = {};

    for (let w = 0; w < 16; w++) {
        weekBuckets[w] = { present: 0, total: 0, gradeSum: 0, gradeCount: 0, submittedCount: 0, totalAssignments: 0, incidents: 0, transportDelays: 0, healthAbsences: 0 };
    }

    for (const a of attendanceRecords) {
        const w = getWeekIndex(new Date(a.date));
        weekBuckets[w].total += 1;
        if (a.status === 'PRESENT') weekBuckets[w].present += 1;
        if (a.status === 'ABSENT') weekBuckets[w].healthAbsences += 1; // count all absences
    }

    for (const g of gradeRecords) {
        const w = getWeekIndex(new Date(g.createdAt));
        weekBuckets[w].gradeSum += (Number(g.score) / Number(g.maxScore)) * 100;
        weekBuckets[w].gradeCount += 1;
    }

    for (const s of submissionRecords) {
        const w = getWeekIndex(new Date(s.createdAt));
        weekBuckets[w].totalAssignments += 1;
        if (s.status === 'SUBMITTED' || s.status === 'GRADED') weekBuckets[w].submittedCount += 1;
    }

    for (const c of complaintRecords) {
        const w = getWeekIndex(new Date(c.createdAt));
        weekBuckets[w].incidents += 1;
    }

    for (const b of boardingRecords) {
        const w = getWeekIndex(new Date(b.timestamp));
        // DEBOARDING without a corresponding BOARDING = potential delay/miss
        if (b.type === 'DEBOARDING') weekBuckets[w].transportDelays += 0; // not a delay
        // A simple proxy: count days with no boarding scan as delays
    }

    // Build 16 WeekData objects
    for (let w = 0; w < 16; w++) {
        const b = weekBuckets[w];
        weeksData.push({
            attendance_pct: b.total > 0 ? (b.present / b.total) * 100 : avgAttendance,
            avg_grade: b.gradeCount > 0 ? b.gradeSum / b.gradeCount : gradeAvg,
            assignment_submission_rate: b.totalAssignments > 0 ? b.submittedCount / b.totalAssignments : 0.8,
            parent_portal_logins: 0, // default 0 — no audit log for parent logins yet
            behavioral_incidents: b.incidents,
            transport_delay_days: b.transportDelays,
            health_absence_days: b.healthAbsences,
        });
    }

    return weeksData;
}

// ─── Function: predictRisk (single student) ────────────────────────────────────

export async function predictRisk(studentId: string) {
    const weeksData = await getStudentWeeklyData(studentId);

    let pythonResult: PythonPredictResponse;
    try {
        const response = await axios.post<PythonPredictResponse>(
            `${PYTHON_AI_URL}/predict`,
            { student_id: studentId, weeks_data: weeksData },
            { timeout: PYTHON_TIMEOUT_MS }
        );
        pythonResult = response.data;
    } catch (err: any) {
        throw new Error(`PYTHON_SERVICE_UNAVAILABLE:${err.message}`);
    }

    // Determine risk level from score if Python didn't return it
    const riskScore = pythonResult.risk_score ?? 0;
    const riskLevel = riskScore >= 70 ? 'RED' : riskScore >= 30 ? 'YELLOW' : 'GREEN';

    // Save to AIRiskScore table
    const saved = await (prisma as any).aIRiskScore.create({
        data: {
            studentId,
            riskScore,
            riskLevel: (pythonResult.risk_level ?? riskLevel) as any,
            confidence: pythonResult.confidence ?? 0,
            topFactors: pythonResult.top_factors ?? [],
            phaseAnalysis: pythonResult.phase_analysis ?? null,
            modelVersion: pythonResult.model_version ?? '1.0',
            dataWeeksUsed: 16,
        },
    });

    return saved;
}

// ─── Function: predictClassRisk (batch) ────────────────────────────────────────

export async function predictClassRisk(cls: string, section?: string) {
    const where: any = { status: 'ACTIVE', class: cls };
    if (section) where.section = section;

    const students = await prisma.student.findMany({
        where,
        select: { id: true, firstName: true, lastName: true, class: true, section: true },
    });

    const results = await Promise.allSettled(
        students.map(s => predictRisk(s.id).then(r => ({ ...r, student: s })))
    );

    const successful = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value)
        .sort((a, b) => b.riskScore - a.riskScore);

    return { students: successful, total: students.length, failed: results.filter(r => r.status === 'rejected').length };
}

// ─── Function: checkPythonServiceHealth ────────────────────────────────────────

export async function checkPythonServiceHealth() {
    try {
        const response = await axios.get(`${PYTHON_AI_URL}/health`, { timeout: 3000 });
        return {
            online: true,
            modelLoaded: response.data?.model_loaded ?? false,
            url: PYTHON_AI_URL,
        };
    } catch {
        return { online: false, modelLoaded: false, url: PYTHON_AI_URL };
    }
}

// ─── Function: generateInterventions (Gemini-powered, 4 parallel calls) ────────

export async function generateInterventions(studentId: string, googleApiKey: string, googleModel: string) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            firstName: true, lastName: true, class: true, section: true,
            attendancePercentage: true, academicGrades: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { subject: true, score: true, maxScore: true },
            },
        },
    });
    if (!student) throw new Error('Student not found');

    // Get latest risk score
    const latestRisk = await (prisma as any).aIRiskScore.findFirst({
        where: { studentId },
        orderBy: { predictedAt: 'desc' },
    });

    if (!latestRisk) {
        // Run prediction first if none exists
        await predictRisk(studentId);
    }

    const risk = latestRisk ?? await (prisma as any).aIRiskScore.findFirst({
        where: { studentId },
        orderBy: { predictedAt: 'desc' },
    });

    // Identify weak subjects
    const weakSubjects = student.academicGrades
        .filter(g => (Number(g.score) / Number(g.maxScore)) < 0.5)
        .map(g => g.subject)
        .slice(0, 3);

    const studentName = `${student.firstName} ${student.lastName}`;
    const factorStr = Array.isArray(risk?.topFactors)
        ? (risk.topFactors as any[]).slice(0, 3).map((f: any) => f.factor || f.description || '').join(', ')
        : 'low attendance, poor grades';

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: googleApiKey });

    const safeJsonCall = async (prompt: string): Promise<any> => {
        try {
            const result = await ai.models.generateContent({
                model: googleModel,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            const text = result.text ?? '{}';
            // Extract JSON block if wrapped in ```json ... ```
            const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : text);
        } catch {
            return { raw: 'AI response could not be parsed as JSON' };
        }
    };

    const teacherPrompt = `You are an expert educational psychologist. A student named ${studentName} in class ${student.class}-${student.section} has been flagged as ${risk?.riskLevel ?? 'YELLOW'} risk (score: ${risk?.riskScore ?? 50}/100). Top risk factors: ${factorStr}. Weak subjects: ${weakSubjects.join(', ') || 'none identified'}. Provide specific classroom intervention actions for their teacher. Respond ONLY in valid JSON: { "actions": [{"what": string, "byWhen": string, "expectedOutcome": string}], "urgency": "low"|"medium"|"high", "nextCheckin": "YYYY-MM-DD", "subjectFocus": string }`;

    const parentPrompt = `You are a supportive school counselor writing to a parent. Their child ${studentName} in class ${student.class}-${student.section} needs some extra attention right now. DO NOT use alarming words. Be warm, specific, and actionable. Respond ONLY in valid JSON: { "subject": string, "message": string, "actions": [string], "supportResources": [string] }`;

    const counselorPrompt = `You are a school counselor doing clinical assessment. Student ${studentName}, class ${student.class}-${student.section}, risk score ${risk?.riskScore ?? 50}. Factors: ${factorStr}. Respond ONLY in valid JSON: { "assessmentPoints": [string], "possibleCauses": [string], "interventions": [string], "escalationTriggers": [string], "sessionPlan": string }`;

    const adminPrompt = `You are advising a school principal on a student at risk. ${studentName}, class ${student.class}-${student.section}, risk ${risk?.riskScore ?? 50}/100. Provide executive-level guidance. Respond ONLY in valid JSON: { "executiveSummary": string, "costOfDropout": string, "actionPlan": [string], "monitoring": string }`;

    // Run all 4 in parallel
    const [teacherResult, parentResult, counselorResult, adminResult] = await Promise.all([
        safeJsonCall(teacherPrompt),
        safeJsonCall(parentPrompt),
        safeJsonCall(counselorPrompt),
        safeJsonCall(adminPrompt),
    ]);

    // Expire after 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const intervention = await (prisma as any).intervention.create({
        data: {
            studentId,
            riskScoreAtGeneration: risk?.riskScore ?? 0,
            teacherIntervention: teacherResult,
            parentIntervention: parentResult,
            counselorIntervention: counselorResult,
            adminIntervention: adminResult,
            feedbackLogs: [],
            expiresAt,
        },
    });

    return intervention;
}
