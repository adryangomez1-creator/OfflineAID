import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize, timeout } from 'rxjs';
import { Noticia } from '../../models/noticia.model';
import { NoticiasService } from '../../services/noticias.service';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './noticias.html',
  styleUrl: './noticias.css'
})
export class NoticiasComponent implements OnInit {
  private readonly noticiasService = inject(NoticiasService);
  private readonly cdr = inject(ChangeDetectorRef);

  noticias: Noticia[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void { this.cargarNoticias(); }

  cargarNoticias(): void {
    this.cargando = true;
    this.error = '';
    this.noticiasService.obtenerNoticias().pipe(
      timeout(15_000),
      finalize(() => { this.cargando = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: respuesta => this.noticias = respuesta.alerts,
      error: () => this.error = 'No se pudieron cargar las noticias en este momento.'
    });
  }
}
