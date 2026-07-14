import { Router } from 'express';
import { chainOfCustodyController } from '../controllers/chain-of-custody.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator.middleware';
import { AddCustodyLogSchema } from '../validators/schemas';

const router = Router();

router.use(authenticateJWT);

router.post('/', validateBody(AddCustodyLogSchema), chainOfCustodyController.addLog);
router.get('/', chainOfCustodyController.listAll);
router.get('/evidence/:evidenceId', chainOfCustodyController.getEvidenceTimeline);
router.get('/officer/:badgeNumber', chainOfCustodyController.getOfficerTimeline);

export default router;
