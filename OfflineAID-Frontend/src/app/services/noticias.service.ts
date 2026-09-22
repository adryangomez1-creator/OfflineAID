import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RespuestaNoticias } from '../models/noticia.model';

@Injectable({ providedIn: 'root' })
export class NoticiasService {
  private readonly http = inject(HttpClient);

  obtenerNoticias(): Observable<RespuestaNoticias> {
    return this.http.get<RespuestaNoticias>('/api/news');
  }
}
