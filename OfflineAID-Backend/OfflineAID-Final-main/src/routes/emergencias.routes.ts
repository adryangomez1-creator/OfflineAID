import { Router, type Router as ExpressRouter } from 'express';
import { emergenciasController } from '../controllers/emergencias.controller.js';

const router: ExpressRouter = Router();

router.get('/emergencias', emergenciasController.obtenerEmergenciasConEvidencias);

router.post('/emergencias/reportar', emergenciasController.reportarEmergencia);

router.get('/emergencias/activas', emergenciasController.obtenerEmergenciasActivas);

router.get('/emergencias/cercanas', emergenciasController.obtenerEmergenciasCercanas);

router.get('/emergencias/detalle/:id', emergenciasController.obtenerDetalleCompleto);

router.get('/emergencias/usuario/:id_usuario', emergenciasController.obtenerEmergenciasPorUsuario);

router.patch('/emergencias/:id/ubicacion', emergenciasController.actualizarUbicacion);

router.patch('/emergencias/:id/estado', emergenciasController.cambiarEstado);
router.put('/emergencias/:id/estado', emergenciasController.cambiarEstado);

export default router;