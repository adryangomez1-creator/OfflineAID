import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { EmergenciaService } from '../../services/emergencia.service';
import { PanelOperadorComponent } from './panel-operador';

describe('PanelOperadorComponent', () => {
  let component: PanelOperadorComponent;
  let fixture: ComponentFixture<PanelOperadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelOperadorComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { cerrarSesion: () => undefined } },
        { provide: EmergenciaService, useValue: { getEmergencias: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelOperadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
