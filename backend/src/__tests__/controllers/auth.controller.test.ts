import { Request, Response } from 'express';
import { register, login } from '../../controllers/auth.controller';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../utils/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));
        req = { body: {} };
        res = {
            status: statusMock,
            json: jsonMock,
        };
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
                role: 'CANDIDATE',
                password: 'hashedPassword',
            };

            req.body = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                role: 'CANDIDATE',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');

            await register(req as Request, res as Response);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(prisma.user.create).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'User registered successfully',
                    user: expect.objectContaining({
                        email: 'test@example.com',
                    }),
                    token: 'mock-token',
                })
            );
        });

        it('should return 400 if user already exists', async () => {
            req.body = {
                email: 'existing@example.com',
                password: 'password123',
                name: 'Test User',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '123' });

            await register(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'User already exists' });
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { email: 'test@example.com' }; // missing password and name

            await register(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Missing required fields' });
        });
    });

    describe('login', () => {
        it('should login user successfully with valid credentials', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
                role: 'CANDIDATE',
                password: 'hashedPassword',
            };

            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-token');

            await login(req as Request, res as Response);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Login successful',
                    token: 'mock-token',
                })
            );
        });

        it('should return 401 if user does not exist', async () => {
            req.body = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await login(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });

        it('should return 401 if password is incorrect', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                password: 'hashedPassword',
            };

            req.body = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await login(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });
    });
});
