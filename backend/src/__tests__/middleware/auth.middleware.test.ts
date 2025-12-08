import { Request, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth.middleware';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req: Partial<AuthRequest>;
    let res: Partial<Response>;
    let next: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));
        req = { headers: {} };
        res = {
            status: statusMock,
            json: jsonMock,
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should authenticate valid token', () => {
        req.headers = { authorization: 'Bearer valid-token' };
        const mockUser = { userId: '123', role: 'STUDENT' };

        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
            callback(null, mockUser);
        });

        authenticateToken(req as AuthRequest, res as Response, next);

        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no token provided', () => {
        req.headers = {};

        authenticateToken(req as AuthRequest, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Authentication token required' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', () => {
        req.headers = { authorization: 'Bearer invalid-token' };

        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null);
        });

        authenticateToken(req as AuthRequest, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(403);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
        expect(next).not.toHaveBeenCalled();
    });
});
