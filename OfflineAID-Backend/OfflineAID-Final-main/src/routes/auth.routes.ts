import { Router, type Router as ExpressRouter } from 'express';
import { authController } from '../controllers/auth.controller.js';

const router: ExpressRouter = Router();

router.post('/auth/registro', authController.registrar);
router.post('/auth/login', authController.iniciarSesion);

export default router;
