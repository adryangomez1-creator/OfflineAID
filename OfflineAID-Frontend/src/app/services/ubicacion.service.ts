import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

interface RespuestaGeocodificacion { direccion: string | null; }

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private readonly http = inject(HttpClient);

  obtenerDireccion(latitud: number, longitud: number): Observable<RespuestaGeocodificacion> {
    return this.http.post<RespuestaGeocodificacion>('/api/ubicacion/geocodificar', { latitud, longitud });
  }
}
