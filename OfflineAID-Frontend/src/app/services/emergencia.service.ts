import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { Emergencia } from '../models/emergencia.model';
import { AlmacenamientoOfflineService } from './almacenamiento-offline.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {
  private http = inject(HttpClient);
  private apiUrl = '/api/emergencias';
  private cambios = new BehaviorSubject<void>(undefined);
  readonly cambios$ = this.cambios.asObservable();

  constructor(private almacenamiento: AlmacenamientoOfflineService, private auth: AuthService) {}

  getEmergencias(): Observable<Emergencia[]> {
    return this.http.get<Emergencia[]>(this.apiUrl);
  }

  getEmergenciaById(id: number): Observable<Emergencia> {
    return this.http.get<Emergencia>(`${this.apiUrl}/${id}`);
  }

  crearEmergencia(emergencia: Emergencia): Observable<{ offline: boolean }> {
    const reporteLocal: Emergencia = {
      ...emergencia,
      id_local: crypto.randomUUID(),
      estado_sync: 'PENDIENTE',
      estado: 'PENDIENTE',
      fecha_creacion: new Date().toISOString()
    };

    if (!navigator.onLine) return this.guardarOffline(reporteLocal);

    return this.http.post(`${this.apiUrl}/reportar`, emergencia).pipe(
      map(() => ({ offline: false })),
      tap(() => this.cambios.next()),
      catchError(() => this.guardarOffline(reporteLocal))
    );
  }

  reportesCombinados(): Observable<Emergencia[]> {
    const idUsuario = this.auth.usuarioActual()?.id_usuario;
    const remotos$ = idUsuario
      ? this.http.get<Emergencia[]>(`${this.apiUrl}/usuario/${idUsuario}`)
      : of([] as Emergencia[]);
    const remotosSeguros$ = remotos$.pipe(
      catchError(() => of([] as Emergencia[]))
    );
    const locales$ = from(this.almacenamiento.obtenerTodos()).pipe(
      catchError(() => of([] as Emergencia[]))
    );

    return combineLatest([locales$, remotosSeguros$]).pipe(
      map(([locales, remotos]) => [...locales.filter(reporte => reporte.id_usuario === idUsuario), ...remotos])
    );
  }

  sincronizarPendientes(): Observable<number> {
    if (!navigator.onLine) return of(0);

    return from(this.almacenamiento.obtenerTodos()).pipe(
      switchMap(reportes => {
        const pendientes = reportes.filter(reporte => reporte.estado_sync !== 'SINCRONIZADO');
        if (!pendientes.length) return of(0);

        return this.http.post<{ detalles?: Array<{ temp_id: string; estado: string }> }>('/api/sync/batch', {
          id_usuario: this.auth.usuarioActual()?.id_usuario,
          operaciones: pendientes.map(reporte => ({
            temp_id: reporte.id_local,
            tipo_operacion: 'CREAR_EMERGENCIA',
            payload: this.aPayload(reporte)
          }))
        }).pipe(
          switchMap(respuesta => from(Promise.all(
            pendientes
              .filter(reporte => respuesta.detalles?.some(detalle => detalle.temp_id === reporte.id_local && detalle.estado === 'SINCRONIZADO'))
              .map(reporte => this.almacenamiento.eliminar(reporte.id_local!))
          )).pipe(map(() => pendientes.length))),
          tap(() => this.cambios.next()),
          catchError(() => of(0))
        );
      })
    );
  }

  private guardarOffline(reporte: Emergencia): Observable<{ offline: boolean }> {
    return from(this.almacenamiento.guardar(reporte)).pipe(
      map(() => ({ offline: true })),
      tap(() => this.cambios.next()),
      catchError(error => throwError(() => error))
    );
  }

  private aPayload(reporte: Emergencia): Omit<Emergencia, 'id_local' | 'estado_sync' | 'error_sync'> {
    const { id_local, estado_sync, error_sync, ...payload } = reporte;
    return payload;
  }
}
