import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelOperador } from './panel-operador';

describe('PanelOperador', () => {
  let component: PanelOperador;
  let fixture: ComponentFixture<PanelOperador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelOperador],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelOperador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
