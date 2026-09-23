import { Router, type Router as ExpressRouter } from 'express';
import { notificacionesController } from '../controllers/notificaciones.controller.js';

const router: ExpressRouter = Router();

router.get('/notificaciones/usuario/:id_usuario/no-leidas', notificacionesController.obtenerNoLeidas);

router.patch('/notificaciones/:id/leida', notificacionesController.marcarLeida);

router.patch('/notificaciones/usuario/:id_usuario/leer-todas', notificacionesController.marcarTodasLeidas);

router.post('/notificaciones/alerta-comunitaria', notificacionesController.emitirAlertaComunitaria);

export default router;
