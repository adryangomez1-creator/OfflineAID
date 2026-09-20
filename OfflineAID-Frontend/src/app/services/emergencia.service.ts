import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Emergencia } from '../models/emergencia.model';

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {
  private http = inject(HttpClient);
  // Cambiado a ruta relativa para que lo intercepte el proxy.conf.json
  private apiUrl = '/api/emergencias';

  // 1. Obtener lista de emergencias
  getEmergencias(): Observable<Emergencia[]> {
    return this.http.get<Emergencia[]>(this.apiUrl);
  }

  // 2. Obtener una sola emergencia por ID
  getEmergenciaById(id: number): Observable<Emergencia> {
    return this.http.get<Emergencia>(`${this.apiUrl}/${id}`);
  }

  // 3. Crear una nueva emergencia
  crearEmergencia(emergencia: Emergencia): Observable<Emergencia> {
    return this.http.post<Emergencia>(this.apiUrl, emergencia);
  }
}
