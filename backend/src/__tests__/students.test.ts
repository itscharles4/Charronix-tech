/// <reference types="jest" />
import request from 'supertest';

import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';

describe('Students API', () => {
    let adminToken: string;
    let createdStudentId: string;

    beforeAll(async () => {
        const email = `admin_test_${Date.now()}@charronix.edu`;
        await prisma.user.create({
            data: { email, passwordHash: await hashPassword('Admin@1234'), role: 'ADMIN' },
        });
        const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'Admin@1234' });
        adminToken = res.body.data.accessToken;
    });

    afterAll(async () => {
        if (createdStudentId) {
            await prisma.student.deleteMany({ where: { id: createdStudentId } });
        }
        await prisma.$disconnect();
    });

    describe('GET /api/v1/students', () => {
        it('should list students with auth', async () => {
            const res = await request(app)
                .get('/api/v1/students')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should reject without auth', async () => {
            const res = await request(app).get('/api/v1/students');
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/v1/students', () => {
        it('should create a student', async () => {
            const res = await request(app)
                .post('/api/v1/students')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    admissionNo: `TEST${Date.now()}`,
                    firstName: 'Test',
                    lastName: 'Student',
                    class: '10',
                    section: 'A',
                    rollNo: 999,
                    parentName: 'Test Parent',
                    parentPhone: '9999999999',
                });
            expect(res.status).toBe(201);
            expect(res.body.data.firstName).toBe('Test');
            createdStudentId = res.body.data.id;
        });

        it('should reject invalid data', async () => {
            const res = await request(app)
                .post('/api/v1/students')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ firstName: 'Missing required fields' });
            expect(res.status).toBe(422);
        });
    });
});
