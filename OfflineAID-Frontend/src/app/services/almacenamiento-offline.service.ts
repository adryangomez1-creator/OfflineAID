import { Injectable } from '@angular/core';
import { Emergencia } from '../models/emergencia.model';

const DB_NAME = 'offlineaid';
const STORE = 'emergencias';

@Injectable({ providedIn: 'root' })
export class AlmacenamientoOfflineService {
  private abrirDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const solicitud = indexedDB.open(DB_NAME, 1);
      solicitud.onupgradeneeded = () => solicitud.result.createObjectStore(STORE, { keyPath: 'id_local' });
      solicitud.onsuccess = () => resolve(solicitud.result);
      solicitud.onerror = () => reject(solicitud.error);
    });
  }

  async guardar(reporte: Emergencia): Promise<void> {
    const db = await this.abrirDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(reporte);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  async obtenerTodos(): Promise<Emergencia[]> {
    const db = await this.abrirDb();
    const reportes = await new Promise<Emergencia[]>((resolve, reject) => {
      const solicitud = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      solicitud.onsuccess = () => resolve(solicitud.result);
      solicitud.onerror = () => reject(solicitud.error);
    });
    db.close();
    return reportes.sort((a, b) => String(b.fecha_creacion).localeCompare(String(a.fecha_creacion)));
  }

  async eliminar(idLocal: string): Promise<void> {
    const db = await this.abrirDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(idLocal);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }
}
