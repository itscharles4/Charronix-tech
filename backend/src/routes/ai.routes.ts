import { Router } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';
import { NextFunction, Response } from 'express';

import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();
router.use(authenticate);

// Chat with AI
router.post('/chat', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }

        // Get recent chat history for context
        const history = await prisma.aiChatHistory.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Save user message
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

        // Save AI response
        await prisma.aiChatHistory.create({
            data: { userId: req.user!.userId, role: 'model', message: aiResponse },
        });

        sendSuccess(res, { message: aiResponse });
    } catch (err) { next(err); }
});

// Get chat history
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

// Clear chat history
router.delete('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        await prisma.aiChatHistory.deleteMany({ where: { userId: req.user!.userId } });
        sendSuccess(res, null, 'Chat history cleared');
    } catch (err) { next(err); }
});

export default router;
