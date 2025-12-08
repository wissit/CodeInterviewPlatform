import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                candidateProfile: true,
                hostedSessions: true,
                scorecards: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { bio } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const profile = await prisma.candidateProfile.create({
            data: {
                userId,
                bio,
            },
        });

        res.status(201).json(profile);
    } catch (error) {
        console.error('Create profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
