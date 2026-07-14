import { Router } from 'express';
import { caseController } from '../controllers/case.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator.middleware';
import { CreateCaseSchema, UpdateCaseSchema } from '../validators/schemas';

const router = Router();

router.use(authenticateJWT);

router.post('/', validateBody(CreateCaseSchema), caseController.create);
router.get('/', caseController.list);
router.get('/:id', caseController.getDetails);
router.put('/:id', validateBody(UpdateCaseSchema), caseController.update);

// Case dockets are high security; only admins or forensics managers can decommission/delete them
router.delete('/:id', authorizeRoles('EVIDENCE_ADMIN', 'ADMIN'), caseController.delete);

export default router;
