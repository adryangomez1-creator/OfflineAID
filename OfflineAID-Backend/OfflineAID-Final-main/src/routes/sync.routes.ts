import { Router, type Router as ExpressRouter } from 'express';
import { syncController } from '../controllers/sync.controller.js';

const router: ExpressRouter = Router();

router.post('/sync/batch', syncController.sincronizarLote);

router.get('/sync/datos-offline', syncController.obtenerDatosOffline);

router.get('/cola-offline/pendientes', syncController.obtenerPendientesCola);

router.post('/cola-offline/:id/reintentar', syncController.reintentarCola);

export default router;
