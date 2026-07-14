import { Router } from 'express';
import { blockchainController } from '../controllers/blockchain.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Protect blockchain routes with JWT
router.use(authenticateJWT);

router.get('/blocks', blockchainController.getBlocks);
router.get('/validate', blockchainController.validateChain);

export default router;
