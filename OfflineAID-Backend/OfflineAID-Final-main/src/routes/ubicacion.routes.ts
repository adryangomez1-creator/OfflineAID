import { Router, type Router as ExpressRouter } from 'express';
import { ubicacionController } from '../controllers/ubicacion.controller.js';

const router: ExpressRouter = Router();
router.post('/ubicacion/geocodificar', ubicacionController.geocodificar);

export default router;
