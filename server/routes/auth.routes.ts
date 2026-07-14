import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator.middleware';
import { RegisterSchema, LoginSchema } from '../validators/schemas';

const router = Router();

router.post('/register', validateBody(RegisterSchema), authController.register);
router.post('/login', validateBody(LoginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

router.get('/profile', authenticateJWT, authController.getProfile);
router.put('/profile', authenticateJWT, authController.updateProfile);

export default router;
