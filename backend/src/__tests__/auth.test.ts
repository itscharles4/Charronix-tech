/// <reference types="jest" />
import request from 'supertest';

import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';

describe('Auth API', () => {
    let testEmail: string;

    beforeAll(async () => {
        testEmail = `test_${Date.now()}@charronix.edu`;
        await prisma.user.create({
            data: {
                email: testEmail,
                passwordHash: await hashPassword('Test@1234'),
                role: 'ADMIN',
            },
        });
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: testEmail } });
        await prisma.$disconnect();
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: testEmail, password: 'Test@1234' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: testEmail, password: 'WrongPassword' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should reject missing fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: testEmail });

            expect(res.status).toBe(422);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('should return user profile with valid token', async () => {
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: testEmail, password: 'Test@1234' });

            const token = loginRes.body.data.accessToken;

            const res = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.email).toBe(testEmail);
        });

        it('should reject request without token', async () => {
            const res = await request(app).get('/api/v1/auth/me');
            expect(res.status).toBe(401);
        });
    });
});
