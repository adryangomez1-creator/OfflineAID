import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmergenciaService } from '../../services/emergencia.service';

=======
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmergenciaService } from '../../services/emergencia.service';
import { AuthService } from '../../services/auth.service';
import { UbicacionService } from '../../services/ubicacion.service';
import { timeout } from 'rxjs';
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3

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
<<<<<<< HEAD
  private cdr = inject(ChangeDetectorRef);
=======
  private auth = inject(AuthService);
  private ubicacion = inject(UbicacionService);
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3

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
<<<<<<< HEAD
    id_usuario: [1, [Validators.required]], // ID de usuario temporal para pruebas
=======
    id_usuario: [this.auth.usuarioActual()?.id_usuario ?? null, [Validators.required]],
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3
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
<<<<<<< HEAD
      next: ({ offline }) => {
        this.cargando = false;
        this.mensajeExito = true;
        this.mensajeOffline = offline ? 'Reporte guardado en este dispositivo. Se enviará al recuperar conexión.' : '';
        this.formEmergencia.reset({ id_usuario: 1 });
=======
      next: ({ offline, direccion }) => {
        this.cargando = false;
        this.mensajeExito = true;
        this.mensajeOffline = offline
          ? 'Reporte guardado en este dispositivo. Se enviará al recuperar conexión.'
          : direccion ? `Reporte guardado. Dirección registrada: ${direccion}` : '';
        this.formEmergencia.reset({ id_usuario: this.auth.usuarioActual()?.id_usuario ?? null });
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3
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
<<<<<<< HEAD
      async posicion => {
        const { latitude, longitude } = posicion.coords;
        this.formEmergencia.patchValue({ latitud: latitude, longitud: longitude });
        this.ubicacionMensaje = `📍 Coordenadas: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} — Buscando dirección…`;
        this.cdr.detectChanges();

        // Llamada a OpenStreetMap Nominatim para geocodificación inversa
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
          const respuesta = await fetch(url, {
            headers: {
              'Accept-Language': 'es',
              'User-Agent': 'OfflineAid-EmergencySystem/1.0'
            }
          });
          if (respuesta.ok) {
            const datos = await respuesta.json();
            if (datos?.display_name) {
              const direccionTexto = String(datos.display_name).trim().slice(0, 255);
              this.formEmergencia.patchValue({ direccion: direccionTexto });
              this.ubicacionMensaje = `✅ Ubicación guardada`;
            } else {
              this.ubicacionMensaje = `✅ Coordenadas guardadas (dirección no disponible)`;
            }
          } else {
            this.ubicacionMensaje = `✅ Coordenadas guardadas (sin conexión a mapa)`;
          }
        } catch {
          // Sin internet o error de Nominatim — las coordenadas igual se guardaron
          this.ubicacionMensaje = `✅ Coordenadas guardadas (dirección no disponible offline)`;
        }
        this.cdr.detectChanges();
=======
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
>>>>>>> 7c8105196893229ee258a346515a685f36d30ce3
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
