import { Router } from 'express';
import { createSession, getSession, joinSession, leaveSession } from '../controllers/session.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, createSession);
router.get('/:id', authenticateToken, getSession);
router.post('/:id/join', authenticateToken, joinSession);
router.delete('/:id/leave', authenticateToken, leaveSession);

export default router;
