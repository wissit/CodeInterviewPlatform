import request from 'supertest';
import app from '../../index';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';

const testUser = {
    email: 'integration-test-user@example.com',
    password: 'Password123!',
    name: 'Integration Test User',
    role: 'CANDIDATE',
};

describe('Auth Integration Flow', () => {
    beforeAll(async () => {
        // Clean up database before tests in correct order
        await prisma.participant.deleteMany();
        await prisma.chatMessage.deleteMany();
        await prisma.execution.deleteMany();
        await prisma.scorecard.deleteMany();
        await prisma.playbackData.deleteMany();
        await prisma.session.deleteMany();
        await prisma.candidateProfile.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should complete a full registration and login flow', async () => {
        // 1. Register
        const registerRes = await request(app)
            .post('/v1/auth/register')
            .send(testUser);

        expect(registerRes.status).toBe(201);
        expect(registerRes.body.user.email).toBe(testUser.email);
        expect(registerRes.body).toHaveProperty('token');

        // 2. Initial Login
        const loginRes = await request(app)
            .post('/v1/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.user.email).toBe(testUser.email);
        expect(loginRes.body).toHaveProperty('token');

        // 3. Login with Wrong Password
        const failRes = await request(app)
            .post('/v1/auth/login')
            .send({
                email: testUser.email,
                password: 'WrongPassword',
            });

        expect(failRes.status).toBe(401);
    });

    it('should hash passwords correctly in database', async () => {
        const user = await prisma.user.findUnique({
            where: { email: testUser.email },
        });

        expect(user).toBeTruthy();
        expect(user!.password).not.toBe(testUser.password);

        const isMatch = await bcrypt.compare(testUser.password, user!.password);
        expect(isMatch).toBe(true);
    });
});
