import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import { corsOptions } from './config/cors';
import { env } from './config/env';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import teacherRoutes from './routes/teacher.routes';
import attendanceRoutes from './routes/attendance.routes';
import gradeRoutes from './routes/grade.routes';
import noticeRoutes from './routes/notice.routes';
import dashboardRoutes from './routes/dashboard.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import auditRoutes from './routes/audit.routes';
import settingsRoutes from './routes/settings.routes';
import aiRoutes from './routes/ai.routes';
import timetableRoutes from './routes/timetable.routes';
import parentRoutes from './routes/parent.routes';
import complaintRoutes from './routes/complaint.routes';
import feeRoutes from './routes/fee.routes';
import assignmentRoutes from './routes/assignment.routes';
import { WebhookController } from './controllers/webhook.controller';

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions));
app.use(globalRateLimiter);

// ============================================
// REQUEST PARSING
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// LOGGING
// ============================================
if (env.NODE_ENV !== 'test') {
    const logStream = {
        write: (message: string) => logger.info(message.trim()),
    };
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logStream }));
}

// ============================================
// STATIC FILES (uploads)
// ============================================
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (_req: express.Request, res: express.Response) => {

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: env.NODE_ENV,
    });
});

// ============================================
// API ROUTES
// ============================================
const apiPrefix = `/api/${env.API_VERSION}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/students`, studentRoutes);
app.use(`${apiPrefix}/teachers`, teacherRoutes);
app.use(`${apiPrefix}/attendance`, attendanceRoutes);
app.use(`${apiPrefix}/grades`, gradeRoutes);
app.use(`${apiPrefix}/notices`, noticeRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/audit`, auditRoutes);
app.use(`${apiPrefix}/settings`, settingsRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);
app.use(`${apiPrefix}/timetable`, timetableRoutes);
app.use(`${apiPrefix}/parents`, parentRoutes);
app.use(`${apiPrefix}/complaints`, complaintRoutes);
app.use(`${apiPrefix}/fees`, feeRoutes);
app.use(`${apiPrefix}/assignments`, assignmentRoutes);
app.post(`${apiPrefix}/webhooks/razorpay`, WebhookController.handleRazorpay);

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
