import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Emergencia, EstadoEmergencia } from '../../models/emergencia.model';
import { EmergenciaService } from '../../services/emergencia.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-panel-operador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-operador.html',
  styleUrls: ['./panel-operador.css']
})
export class PanelOperadorComponent implements OnInit {
  private readonly emergenciaService = inject(EmergenciaService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  listaEmergencias: Emergencia[] = [];
  emergenciaSeleccionada: Emergencia | null = null;
  cargando = false;

  ngOnInit(): void {
    this.cargarEmergencias();
  }

  cargarEmergencias(): void {
    this.cargando = true;
    this.emergenciaService.getEmergencias().subscribe({
      next: (data) => {
        this.listaEmergencias = data;
        this.cargando = false;
      },
      error: (err: unknown) => {
        console.error('Error al cargar emergencias:', err);
        this.cargando = false;
      }
    });
  }

  seleccionarEmergencia(emergencia: Emergencia): void {
    this.emergenciaSeleccionada = emergencia;
  }

  actualizarEstado(nuevoEstado: EstadoEmergencia): void {
    if (!this.emergenciaSeleccionada) return;

    const id = this.emergenciaSeleccionada.id_emergencia || this.emergenciaSeleccionada.id_local;

    if (!id) {
      console.error('No se encontró un ID válido en el objeto:', this.emergenciaSeleccionada);
      return;
    }

    this.emergenciaService.actualizarEstado(id, nuevoEstado).subscribe({
      next: () => {
        if (this.emergenciaSeleccionada) this.emergenciaSeleccionada.estado = nuevoEstado;
        this.cargarEmergencias();
      },
      error: (err: unknown) => console.error('Error al actualizar estado:', err)
    });
  }
  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigateByUrl('/login');
  }
}