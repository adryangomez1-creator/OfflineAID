import { Router, type Router as ExpressRouter } from 'express';
import { asignacionesController } from '../controllers/asignaciones.controller.js';

const router: ExpressRouter = Router();

router.post('/emergencias/:id/asignar', asignacionesController.asignarInstitucion);

router.patch('/asignaciones/:id/estado', asignacionesController.actualizarEstado);

router.get('/instituciones/:id/emergencias', asignacionesController.obtenerPorInstitucion);

export default router;
