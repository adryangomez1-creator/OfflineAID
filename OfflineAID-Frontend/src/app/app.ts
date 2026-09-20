import { Component } from '@angular/core';
import { CrearEmergenciaComponent } from './components/crear-emergencia/crear-emergencia';
import { ListaEmergenciasComponent } from './components/lista-emergencias/lista-emergencias';

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
export class AppComponent {
  title = 'OfflineAID-Frontend';
}
