import { Request, Response } from 'express';
import { obtenerDireccionDesdeCoordenadas } from '../services/geocoding.service.js';

export const ubicacionController = {
  geocodificar: async (req: Request, res: Response): Promise<void> => {
    const { latitud, longitud } = req.body;
    const lat = Number(latitud);
    const lon = Number(longitud);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      res.status(400).json({ error: 'Latitud y longitud válidas son obligatorias' });
      return;
    }

    try {
      const direccion = await obtenerDireccionDesdeCoordenadas(lat, lon);
      res.json({ latitud: lat, longitud: lon, direccion });
    } catch {
      res.status(502).json({ error: 'No se pudo obtener la dirección' });
    }
  }
};
