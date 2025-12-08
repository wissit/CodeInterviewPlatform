import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createSession = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Debug logging
        console.log('===== CREATE SESSION DEBUG =====');
        console.log('Full req.user object:', JSON.stringify(req.user, null, 2));
        console.log('User ID:', userId);
        console.log('User Role:', userRole);
        console.log('Role Type:', typeof userRole);
        console.log('Comparison result (userRole !== "INTERVIEWER"):', userRole !== 'INTERVIEWER');
        console.log('================================');

        // Only INTERVIEWERs can create sessions
        if (userRole !== 'INTERVIEWER') {
            console.log('REJECTED: Role does not match INTERVIEWER');
            return res.status(403).json({
                error: 'Only interviewers can create sessions',
                debug: { receivedRole: userRole, expectedRole: 'INTERVIEWER' }
            });
        }

        const { title, language } = req.body;

        const session = await prisma.session.create({
            data: {
                hostId: userId,
                title: title || 'Untitled Session',
                language: language || 'javascript',
                status: 'ACTIVE',
                currentCode: '',
            },
            include: {
                host: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });

        res.status(201).json(session);
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSession = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const session = await prisma.session.findUnique({
            where: { id },
            include: {
                host: {
                    select: { id: true, name: true, email: true, role: true },
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, role: true },
                        },
                    },
                },
            },
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const joinSession = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const session = await prisma.session.findUnique({
            where: { id },
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Check if already a participant
        const existingParticipant = await prisma.participant.findFirst({
            where: { sessionId: id, userId },
        });

        if (existingParticipant) {
            return res.status(200).json({ message: 'Already joined', participant: existingParticipant });
        }

        // Fetch user to get name
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const participant = await prisma.participant.create({
            data: {
                sessionId: id,
                userId,
                name: user.name,
                role: 'GUEST',
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });

        res.status(201).json(participant);
    } catch (error) {
        console.error('Join session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const leaveSession = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await prisma.participant.deleteMany({
            where: { sessionId: id, userId },
        });

        res.json({ message: 'Left session successfully' });
    } catch (error) {
        console.error('Leave session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
