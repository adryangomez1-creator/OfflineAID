import { Component, isDevMode, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CrearEmergenciaComponent } from './components/crear-emergencia/crear-emergencia';
import { ListaEmergenciasComponent } from './components/lista-emergencias/lista-emergencias';
import { ConexionService } from './services/conexion.service';
import { EmergenciaService } from './services/emergencia.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CrearEmergenciaComponent,
    ListaEmergenciasComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'OfflineAID-Frontend';
  private conexion = inject(ConexionService);
  private emergenciaService = inject(EmergenciaService);
  enLinea = navigator.onLine;
  sincronizando = false;
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

  sincronizarPendientes(): void {
    if (!this.enLinea || this.sincronizando) return;
    this.sincronizando = true;
    this.emergenciaService.sincronizarPendientes().subscribe({ complete: () => this.sincronizando = false });
  }
}
