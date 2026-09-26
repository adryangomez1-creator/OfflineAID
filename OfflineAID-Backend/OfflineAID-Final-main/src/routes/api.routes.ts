import { Router, type Router as ExpressRouter } from 'express';
import { emergenciasController } from '../controllers/emergencias.controller.js';
import { syncController } from '../controllers/sync.controller.js';
import { ubicacionController } from '../controllers/ubicacion.controller.js';
import { autenticar, permitirRoles } from '../middleware/auth.middleware.js';
import authRoutes from './auth.routes.js';
import newsRoutes from './news.routes.js';

const router: ExpressRouter = Router();

router.use(authRoutes);
router.use(newsRoutes);

router.use(autenticar);

router.post('/emergencias/reportar', permitirRoles('CIUDADANO'), emergenciasController.reportarEmergencia);
router.get('/emergencias/usuario/:id_usuario', permitirRoles('CIUDADANO'), emergenciasController.obtenerEmergenciasPorUsuario);
router.post('/sync/batch', permitirRoles('CIUDADANO'), syncController.sincronizarLote);
router.post('/ubicacion/geocodificar', permitirRoles('CIUDADANO'), ubicacionController.geocodificar);

router.get('/emergencias', permitirRoles('ADMIN'), emergenciasController.obtenerEmergenciasConEvidencias);
router.put('/emergencias/:id/estado', permitirRoles('ADMIN'), emergenciasController.cambiarEstado);
router.patch('/emergencias/:id/estado', permitirRoles('ADMIN'), emergenciasController.cambiarEstado);

router.use((_req, res) => {
  res.status(403).json({ error: 'Esta ruta no está habilitada' });
});

export default router;
