import { Router } from 'express';
import { executeCode } from '../controllers/execution.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protected route - only logged in users can run code (prevents abuse)
router.post('/', authenticateToken, executeCode);

export default router;
