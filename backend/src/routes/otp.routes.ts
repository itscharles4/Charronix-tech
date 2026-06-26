import { Router, Request, Response } from 'express';
import axios from 'axios';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const TEXTBEE_API_KEY = 'c04bc1f9-70b1-45da-96bf-a1a6c57b2176';
const TEXTBEE_DEVICE_ID = '6a3a244677015dcde1f8c595';

// In-memory OTP store (Redis in production is better, but this works for dev)
const otpStore = new Map<string, { otp: string; expires: number; data: any }>();

// POST /api/v1/otp/send
router.post('/send', async (req: Request, res: Response) => {
    const { phone, firstName, lastName, email, password, institutionName } = req.body;

    if (!phone || !firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Normalize phone to E.164 format for India
    let normalized = phone.toString().trim().replace(/\s+/g, '');
    if (!normalized.startsWith('+')) {
        normalized = normalized.startsWith('91') ? `+${normalized}` : `+91${normalized}`;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP with user data
    otpStore.set(normalized, {
        otp,
        expires,
        data: { firstName, lastName, email, password, phone: normalized, institutionName }
    });

    try {
        // Send OTP via textbee
        await axios.post(
            `https://api.textbee.dev/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`,
            {
                recipients: [normalized],
                message: `Your Charronix verification OTP is: ${otp}\nValid for 10 minutes. Do not share this code.`
            },
            { headers: { 'x-api-key': TEXTBEE_API_KEY } }
        );

        return res.json({ success: true, message: `OTP sent to ${normalized}` });
    } catch (err: any) {
        console.error('TextBee SMS error:', err?.response?.data || err.message);
        // For dev: still return OTP in response so you can test without real SMS
        return res.json({
            success: true,
            message: 'OTP generated (SMS gateway error — check console)',
            devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
        });
    }
});

// POST /api/v1/otp/verify
router.post('/verify', async (req: Request, res: Response) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    let normalized = phone.toString().trim().replace(/\s+/g, '');
    if (!normalized.startsWith('+')) {
        normalized = normalized.startsWith('91') ? `+${normalized}` : `+91${normalized}`;
    }

    const record = otpStore.get(normalized);
    if (!record) {
        return res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new one.' });
    }

    if (Date.now() > record.expires) {
        otpStore.delete(normalized);
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // OTP is valid — clear it and proceed
    const userData = record.data;
    otpStore.delete(normalized);

    try {
        // 1. Check if user already exists
        let user = await prisma.user.findUnique({ where: { email: userData.email } });
        
        if (!user) {
            // 2. Create the user in the database
            const passwordHash = await hashPassword(userData.password);
            user = await prisma.user.create({
                data: {
                    email: userData.email,
                    passwordHash,
                    role: Role.PRINCIPAL, // Assigning Principal role to new trial accounts
                    loginId: normalized.replace('+', ''), // e.g. 919876543210
                }
            });
        }

        // 3. Generate Auth Tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const tokenId = uuidv4();
        const refreshToken = generateRefreshToken({ userId: user.id, tokenId });

        await prisma.refreshToken.create({
            data: { id: tokenId, userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        });

        return res.json({
            success: true,
            message: 'OTP verified and account created successfully',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone,
                institutionName: userData.institutionName || '',
                onboarded: true,
            }
        });
    } catch (err) {
        console.error('Failed to create user after OTP:', err);
        return res.status(500).json({ success: false, message: 'Account creation failed after verification. Please try again.' });
    }
});

export default router;
