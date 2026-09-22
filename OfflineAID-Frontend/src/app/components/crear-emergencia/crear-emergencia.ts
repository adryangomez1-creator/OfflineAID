import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmergenciaService } from '../../services/emergencia.service';
import { AuthService } from '../../services/auth.service';
import { UbicacionService } from '../../services/ubicacion.service';
import { timeout } from 'rxjs';

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
  private auth = inject(AuthService);
  private ubicacion = inject(UbicacionService);

  cargando = false;
  mensajeExito = false;
  mensajeOffline = '';
  errorMensaje = '';
  ubicacionMensaje = '';
  archivos: File[] = [];

  readonly tipos = [
    { id: 1, nombre: 'Accidente de tránsito', prioridad: 'ALTA' },
    { id: 2, nombre: 'Sismo o terremoto', prioridad: 'CRITICA' },
    { id: 3, nombre: 'Inundación o deslave', prioridad: 'CRITICA' },
    { id: 4, nombre: 'Incendio', prioridad: 'ALTA' },
    { id: 5, nombre: 'Emergencia médica grave', prioridad: 'CRITICA' },
    { id: 6, nombre: 'Emergencia médica menor', prioridad: 'MEDIA' },
    { id: 7, nombre: 'Falla eléctrica', prioridad: 'BAJA' },
    { id: 8, nombre: 'Búsqueda y rescate', prioridad: 'ALTA' }
  ];

  // Formulario con validaciones sencillas
  formEmergencia: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5)]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    id_tipo: [null, [Validators.required]],
    id_usuario: [this.auth.usuarioActual()?.id_usuario ?? null, [Validators.required]],
    direccion: [''],
    latitud: [null],
    longitud: [null]
  });

  guardar(): void {
    if (this.formEmergencia.invalid) {
      this.formEmergencia.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeExito = false;
    this.mensajeOffline = '';
    this.errorMensaje = '';

    this.leerEvidencias().then(evidencias => this.emergenciaService.crearEmergencia({ ...this.formEmergencia.value, evidencias }).subscribe({
      next: ({ offline, direccion }) => {
        this.cargando = false;
        this.mensajeExito = true;
        this.mensajeOffline = offline
          ? 'Reporte guardado en este dispositivo. Se enviará al recuperar conexión.'
          : direccion ? `Reporte guardado. Dirección registrada: ${direccion}` : '';
        this.formEmergencia.reset({ id_usuario: this.auth.usuarioActual()?.id_usuario ?? null });
        this.archivos = [];
        this.ubicacionMensaje = '';
      },
      error: (err) => {
        console.error('Error al guardar emergencia:', err);
        this.cargando = false;
        this.errorMensaje = 'No se pudo registrar la emergencia. Revisa la conexión.';
      }
    }));
  }

  capturarUbicacion(): void {
    if (!navigator.geolocation) {
      this.ubicacionMensaje = 'Este navegador no permite obtener ubicación.';
      return;
    }
    this.ubicacionMensaje = 'Obteniendo ubicación…';
    navigator.geolocation.getCurrentPosition(
      posicion => {
        const { latitude, longitude } = posicion.coords;
        this.formEmergencia.patchValue({ latitud: latitude, longitud: longitude });
        this.ubicacionMensaje = 'Ubicación capturada. Buscando dirección…';
        this.ubicacion.obtenerDireccion(latitude, longitude).pipe(timeout(6_000)).subscribe({
          next: ({ direccion }) => {
            if (direccion) {
              this.formEmergencia.patchValue({ direccion });
              this.ubicacionMensaje = 'Ubicación guardada como dirección.';
            } else {
              this.ubicacionMensaje = 'Ubicación capturada; no se encontró una dirección.';
            }
          },
          error: () => this.ubicacionMensaje = 'Ubicación capturada. La dirección se resolverá al enviar el reporte.'
        });
      },
      () => this.ubicacionMensaje = 'No fue posible obtener la ubicación. Revisa los permisos del navegador.',
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }

  seleccionarEvidencias(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.archivos = Array.from(input.files ?? []).slice(0, 3);
  }

  prioridadActual(): string {
    return this.tipos.find(tipo => tipo.id === Number(this.formEmergencia.value.id_tipo))?.prioridad ?? 'SIN SELECCIONAR';
  }

  private leerEvidencias(): Promise<string[]> {
    return Promise.all(this.archivos.map(archivo => new Promise<string>(resolve => {
      const lector = new FileReader();
      lector.onload = () => resolve(String(lector.result));
      lector.onerror = () => resolve('');
      lector.readAsDataURL(archivo);
    }))).then(evidencias => evidencias.filter(Boolean));
  }
}
