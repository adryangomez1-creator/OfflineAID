import { Component, effect, isDevMode, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CrearEmergenciaComponent } from './components/crear-emergencia/crear-emergencia';
import { NoticiasComponent } from './components/noticias/noticias';
import { ListaEmergenciasComponent } from './components/lista-emergencias/lista-emergencias';
import { ConexionService } from './services/conexion.service';
import { EmergenciaService } from './services/emergencia.service';
import { AuthService } from './services/auth.service';
import { UbicacionService } from './services/ubicacion.service';
import { timeout } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CrearEmergenciaComponent,
    NoticiasComponent,
    ListaEmergenciasComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'OfflineAID-Frontend';
  private conexion = inject(ConexionService);
  private emergenciaService = inject(EmergenciaService);
  private auth = inject(AuthService);
  private ubicacion = inject(UbicacionService);
  private router = inject(Router);
  enLinea = navigator.onLine;
  sincronizando = false;
  mostrarFormulario = false;
  direccionActual = 'Obteniendo ubicación…';
  private direccionEffect = effect(() => {
    if (this.usuario()) this.cargarDireccionActual();
    else this.direccionActual = '';
  });
  readonly usuario = this.auth.usuario;
  private conexionSub?: Subscription;

  ngOnInit(): void {
    this.conexionSub = this.conexion.estado.subscribe(enLinea => {
      const regresoConexion = !this.enLinea && enLinea;
      this.enLinea = enLinea;
      if (regresoConexion) this.sincronizarPendientes();
    });
    if ('serviceWorker' in navigator) {
      if (isDevMode()) {
        navigator.serviceWorker.getRegistrations().then(registros => registros.forEach(registro => registro.unregister()));
      } else {
        navigator.serviceWorker.register('/service-worker.js').catch(() => undefined);
      }
    }
  }

  ngOnDestroy(): void { this.conexionSub?.unsubscribe(); }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigateByUrl('/login');
  }

  abrirReporte(): void { this.mostrarFormulario = true; }

  private cargarDireccionActual(): void {
    if (!navigator.geolocation) {
      this.direccionActual = 'Ubicación no disponible';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => this.ubicacion.obtenerDireccion(coords.latitude, coords.longitude).pipe(timeout(5_000)).subscribe({
        next: ({ direccion }) => this.direccionActual = direccion ?? 'Dirección no encontrada',
        error: () => this.direccionActual = 'Dirección no disponible'
      }),
      () => this.direccionActual = 'Permite la ubicación para mostrar tu dirección',
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  }

  sincronizarPendientes(): void {
    if (!this.enLinea || this.sincronizando) return;
    this.sincronizando = true;
    this.emergenciaService.sincronizarPendientes().subscribe({ complete: () => this.sincronizando = false });
  }
}
