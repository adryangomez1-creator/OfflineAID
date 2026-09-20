import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
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

  emergencias: Emergencia[] = [];
  cargando: boolean = true;
  error: string | null = null;
  private cambios?: Subscription;

  ngOnInit(): void {
    this.cargarEmergencias();
    this.cambios = this.emergenciaService.cambios$.subscribe(() => this.cargarEmergencias());
  }

  ngOnDestroy(): void { this.cambios?.unsubscribe(); }

  cargarEmergencias(): void {
    this.cargando = true;
    this.error = null;

    this.emergenciaService.reportesCombinados().subscribe({
      next: (data) => {
        this.emergencias = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener emergencias:', err);
        this.error = 'No se pudieron cargar las emergencias guardadas.';
        this.cargando = false;
      }
    });
  }
}
