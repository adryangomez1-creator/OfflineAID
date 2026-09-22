import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { finalize, timeout } from 'rxjs';
import { Subscription, skip } from 'rxjs';
import { Emergencia } from '../../models/emergencia.model';
import { EmergenciaService } from '../../services/emergencia.service';

@Component({
  selector: 'app-lista-emergencias',
  standalone: true,
  imports: [], // Con la sintaxis @if y @for ya no dependes de CommonModule aquí
  templateUrl: './lista-emergencias.html',
  styleUrl: './lista-emergencias.css'
})
export class ListaEmergenciasComponent implements OnInit, OnDestroy {
  private emergenciaService = inject(EmergenciaService);
  private cdr = inject(ChangeDetectorRef);

  emergencias: Emergencia[] = [];
  cargando: boolean = true;
  error: string | null = null;
  private cambiosSub?: Subscription;

  ngOnInit(): void {
    this.cargarEmergencias();
    // skip(1): evita que BehaviorSubject emita inmediatamente al suscribirse (ya lo manejamos arriba)
    this.cambiosSub = this.emergenciaService.cambios$.pipe(skip(1)).subscribe(() => this.cargarEmergencias());
  }

  ngOnDestroy(): void { 
    this.cambiosSub?.unsubscribe(); 
  }

  cargarEmergencias(): void {
    this.cargando = true;
    this.error = null;

    this.emergenciaService.reportesCombinados().pipe(
      timeout(5_000),
      finalize(() => { this.cargando = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => { this.emergencias = data; },
      error: (err) => {
        console.error('Error al obtener emergencias:', err);
        this.error = 'No se pudieron cargar las emergencias guardadas.';
      }
    });
  }

  sincronizar(): void {
    this.cargando = true;
    this.error = null;

    this.emergenciaService.sincronizarPendientes().subscribe({
      next: (cantidad) => {
        console.log(`✅ Sincronización completada. Se procesaron ${cantidad} reportes pendientes.`);
        // Una vez sincronizado, volvemos a cargar la lista remota
        this.cargarEmergencias(); 
      },
      error: (err) => {
        console.error('Error al sincronizar:', err);
        this.error = 'No se pudieron enviar los reportes pendientes.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}

