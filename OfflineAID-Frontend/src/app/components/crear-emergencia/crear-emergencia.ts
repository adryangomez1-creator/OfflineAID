import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmergenciaService } from '../../services/emergencia.service';

@Component({
  selector: 'app-crear-emergencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-emergencia.html',
  styleUrl: './crear-emergencia.css'
})
export class CrearEmergenciaComponent {
  private fb = inject(FormBuilder);
  private emergenciaService = inject(EmergenciaService);

  cargando = false;
  mensajeExito = false;
  errorMensaje = '';

  // Formulario con validaciones sencillas
  formEmergencia: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5)]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    id_tipo: [1, [Validators.required]],
    id_usuario: [1, [Validators.required]], // ID de usuario temporal para pruebas
    direccion: ['']
  });

  guardar(): void {
    if (this.formEmergencia.invalid) {
      this.formEmergencia.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeExito = false;
    this.errorMensaje = '';

    this.emergenciaService.crearEmergencia(this.formEmergencia.value).subscribe({
      next: () => {
        this.cargando = false;
        this.mensajeExito = true;
        this.formEmergencia.reset({ id_tipo: 1, id_usuario: 1 });
      },
      error: (err) => {
        console.error('Error al guardar emergencia:', err);
        this.cargando = false;
        this.errorMensaje = 'No se pudo registrar la emergencia. Revisa la conexión.';
      }
    });
  }
}
