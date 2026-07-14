import { Router } from 'express';
import { evidenceController } from '../controllers/evidence.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator.middleware';
import { upload } from '../middlewares/upload';
import { IngestEvidenceSchema, UpdateEvidenceSchema } from '../validators/schemas';

const router = Router();

router.use(authenticateJWT);

// Handle optional physical forensic upload or json ingestion
router.post('/ingest', upload.single('file'), (req, res, next) => {
  // If file exists, skip body validation for missing fields since we hydrate them in controller
  if (req.file) {
    return next();
  }
  validateBody(IngestEvidenceSchema)(req, res, next);
}, evidenceController.ingest);

router.get('/', evidenceController.list);
router.get('/:id', evidenceController.getDetails);
router.put('/:id', validateBody(UpdateEvidenceSchema), evidenceController.update);
router.post('/:id/verify', evidenceController.verify);

// Only administrators can decommission and purge evidence logs
router.delete('/:id', authorizeRoles('EVIDENCE_ADMIN', 'ADMIN'), evidenceController.delete);

export default router;
