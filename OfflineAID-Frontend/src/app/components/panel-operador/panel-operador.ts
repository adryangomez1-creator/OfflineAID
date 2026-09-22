import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  listaEmergencias: any[] = [];
  emergenciaSeleccionada: any = null;
  cargando = false;

  ngOnInit(): void {
    this.cargarEmergencias();
  }

  cargarEmergencias(): void {
    this.cargando = true;
    this.emergenciaService.getEmergencias().subscribe({
      next: (data: any) => {
        this.listaEmergencias = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar emergencias:', err);
        this.cargando = false;
      }
    });
  }

  seleccionarEmergencia(emergencia: any): void {
    this.emergenciaSeleccionada = emergencia;
  }

actualizarEstado(nuevoEstado: string): void {
    if (!this.emergenciaSeleccionada) return;

    // Buscamos todas las posibles variantes de la llave primaria que pueda enviar el backend
    const id = this.emergenciaSeleccionada.id 
            || this.emergenciaSeleccionada.id_emergencia 
            || this.emergenciaSeleccionada.id_reporte 
            || this.emergenciaSeleccionada.id_local;

    if (!id) {
      console.error('No se encontró un ID válido en el objeto:', this.emergenciaSeleccionada);
      return;
    }

    this.emergenciaService.actualizarEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.emergenciaSeleccionada.estado = nuevoEstado;
        this.cargarEmergencias();
      },
      error: (err: any) => console.error('Error al actualizar estado:', err)
    });
  }
  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}