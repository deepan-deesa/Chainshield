import { Router } from 'express';
import authRoutes from './auth.routes';
import caseRoutes from './case.routes';
import evidenceRoutes from './evidence.routes';
import custodyRoutes from './chain-of-custody.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import blockchainRoutes from './blockchain.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/custody', custodyRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/blockchain', blockchainRoutes);

export default router;
