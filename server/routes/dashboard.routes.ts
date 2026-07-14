import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/stats', dashboardController.getStats);
router.get('/recent', dashboardController.getRecentActivity);

export default router;
