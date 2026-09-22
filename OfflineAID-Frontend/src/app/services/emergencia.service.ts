import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { Emergencia } from '../models/emergencia.model';
import { AlmacenamientoOfflineService } from './almacenamiento-offline.service';

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {
  private http = inject(HttpClient);
  private apiUrl = '/api/emergencias';
  private cambios = new BehaviorSubject<void>(undefined);
  readonly cambios$ = this.cambios.asObservable();

  constructor(private almacenamiento: AlmacenamientoOfflineService) {}

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
    const remotos$ = this.http.get<Emergencia[]>(this.apiUrl).pipe(
      catchError(() => of([] as Emergencia[]))
    );
    const locales$ = from(this.almacenamiento.obtenerTodos()).pipe(
      catchError(() => of([] as Emergencia[]))
    );

    return combineLatest([locales$, remotos$]).pipe(
      map(([locales, remotos]) => {
        // Creamos un mapa con los reportes oficiales del servidor (que ya tienen el estado actualizado por el operador)
        const remotosMap = new Map();
        remotos.forEach(r => {
          if (r.id_emergencia) remotosMap.set(r.id_emergencia, r);
          if (r.id_emergencia) remotosMap.set(r.id_emergencia, r);
        });

        // Verificamos los locales: si el reporte local ya vive en el servidor, 
        // priorizamos los datos del servidor para reflejar el estado institucional actualizado.
        const localesActualizados = locales.map(local => {
          const match = remotosMap.get(local.id_emergencia || local.id_emergencia);
          return match ? match : local;
        });

        // Filtramos únicamente los locales que siguen pendientes estrictos de subida (offline puro)
        const idsRemotos = new Set(remotos.map(r => r.id_emergencia || r.id_emergencia));
        const pendientesLocales = localesActualizados.filter(l => 
          l.estado_sync === 'PENDIENTE' && !idsRemotos.has(l.id_local)
        );

        // Devolvemos los remotos actualizados + los pendientes locales que aún no suben
        return [...remotos, ...pendientesLocales];
      })
    );
  }

  sincronizarPendientes(): Observable<number> {
    if (!navigator.onLine) return of(0);

    return from(this.almacenamiento.obtenerTodos()).pipe(
      switchMap(reportes => {
        const pendientes = reportes.filter(reporte => reporte.estado_sync !== 'SINCRONIZADO');
        if (!pendientes.length) return of(0);

        return this.http.post<{ detalles?: Array<{ temp_id: string; estado: string }> }>('/api/sync/batch', {
          id_usuario: 1,
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

  // Método requerido por el panel de operador para cambiar estados
// Actualiza este método en tu servicio frontend
  actualizarEstado(id: number | string, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado }).pipe(
      tap(() => this.cambios.next())
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