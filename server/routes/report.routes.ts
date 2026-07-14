import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/case/:caseId', reportController.generateCaseReport);
router.post('/evidence/:evidenceId', reportController.generateEvidenceReport);
router.post('/blockchain', reportController.generateBlockchainReport);
router.get('/', reportController.list);

export default router;
