import { Router } from 'express';
import { getProfile, createProfile } from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', authenticateToken, getProfile);
router.post('/', authenticateToken, createProfile);

export default router;
