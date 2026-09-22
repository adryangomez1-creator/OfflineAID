import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
<<<<<<< HEAD
import { BehaviorSubject, Observable, catchError, combineLatest, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { Emergencia } from '../models/emergencia.model';
import { AlmacenamientoOfflineService } from './almacenamiento-offline.service';
=======
import { BehaviorSubject, Observable, catchError, from, map, of, switchMap, tap, throwError, timeout } from 'rxjs';
import { Emergencia } from '../models/emergencia.model';
import { AlmacenamientoOfflineService } from './almacenamiento-offline.service';
import { AuthService } from './auth.service';
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {
  private http = inject(HttpClient);
<<<<<<< HEAD
=======
  private auth = inject(AuthService);
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3
  // Cambiado a ruta relativa para que lo intercepte el proxy.conf.json
  private apiUrl = '/api/emergencias';
  private cambios = new BehaviorSubject<void>(undefined);
  readonly cambios$ = this.cambios.asObservable();

  constructor(private almacenamiento: AlmacenamientoOfflineService) {}

  // 1. Obtener lista de emergencias
  getEmergencias(): Observable<Emergencia[]> {
    return this.http.get<Emergencia[]>(this.apiUrl);
  }

  // 2. Obtener una sola emergencia por ID
  getEmergenciaById(id: number): Observable<Emergencia> {
    return this.http.get<Emergencia>(`${this.apiUrl}/${id}`);
  }

  // 3. Crear una nueva emergencia
<<<<<<< HEAD
  crearEmergencia(emergencia: Emergencia): Observable<{ offline: boolean }> {
=======
  crearEmergencia(emergencia: Emergencia): Observable<{ offline: boolean; direccion?: string | null }> {
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3
    const reporteLocal: Emergencia = {
      ...emergencia,
      id_local: crypto.randomUUID(),
      estado_sync: 'PENDIENTE',
      estado: 'PENDIENTE',
      fecha_creacion: new Date().toISOString()
    };

    if (!navigator.onLine) return this.guardarOffline(reporteLocal);

<<<<<<< HEAD
    return this.http.post(`${this.apiUrl}/reportar`, emergencia).pipe(
      map(() => ({ offline: false })),
=======
    return this.http.post<{ direccion?: string | null }>(`${this.apiUrl}/reportar`, emergencia).pipe(
      timeout(12_000),
      map(respuesta => ({ offline: false, direccion: respuesta.direccion })),
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3
      tap(() => this.cambios.next()),
      catchError(() => this.guardarOffline(reporteLocal))
    );
  }

  reportesCombinados(): Observable<Emergencia[]> {
<<<<<<< HEAD
    const remotos$ = this.http.get<Emergencia[]>(this.apiUrl).pipe(
      catchError(() => of([] as Emergencia[]))
    );
    const locales$ = from(this.almacenamiento.obtenerTodos()).pipe(
      catchError(() => of([] as Emergencia[]))
    );

    return combineLatest([locales$, remotos$]).pipe(
      map(([locales, remotos]) => [...locales, ...remotos])
=======
    return this.http.get<Emergencia[]>(this.apiUrl).pipe(
      timeout(3_000),
      catchError(() => of([])),
      switchMap(remotos => from(this.almacenamiento.obtenerTodos()).pipe(map(locales => [...locales, ...remotos])))
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3
    );
  }

  sincronizarPendientes(): Observable<number> {
    if (!navigator.onLine) return of(0);
    return from(this.almacenamiento.obtenerTodos()).pipe(
      switchMap(reportes => {
        const pendientes = reportes.filter(r => r.estado_sync !== 'SINCRONIZADO');
        if (!pendientes.length) return of(0);
        return this.http.post<{ detalles?: Array<{ temp_id: string; estado: string }> }>('/api/sync/batch', {
<<<<<<< HEAD
          id_usuario: 1,
=======
          id_usuario: this.auth.usuarioActual()?.id_usuario,
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3
          operaciones: pendientes.map(reporte => ({
            temp_id: reporte.id_local,
            tipo_operacion: 'CREAR_EMERGENCIA',
            payload: this.aPayload(reporte)
          }))
        }).pipe(
          switchMap(respuesta => from(Promise.all(
            pendientes.filter(reporte => respuesta.detalles?.some(d => d.temp_id === reporte.id_local && d.estado === 'SINCRONIZADO'))
              .map(reporte => this.almacenamiento.eliminar(reporte.id_local!))
          )).pipe(map(() => pendientes.length))),
          tap(() => this.cambios.next()),
          catchError(() => of(0))
        );
      })
    );
  }

<<<<<<< HEAD
  private guardarOffline(reporte: Emergencia): Observable<{ offline: boolean }> {
=======
  private guardarOffline(reporte: Emergencia): Observable<{ offline: boolean; direccion?: string | null }> {
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3
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
