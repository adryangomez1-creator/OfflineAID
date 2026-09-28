import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ConexionService } from './services/conexion.service';
import { EmergenciaService } from './services/emergencia.service';
import { UbicacionService } from './services/ubicacion.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { usuario: signal(null), cerrarSesion: () => undefined } },
        { provide: ConexionService, useValue: { estado: new BehaviorSubject(navigator.onLine) } },
        { provide: EmergenciaService, useValue: { sincronizarPendientes: () => of(0) } },
        { provide: UbicacionService, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should expose the application title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toBe('OfflineAID-Frontend');
  });
});
