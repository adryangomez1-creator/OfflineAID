import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { signal } from '@angular/core';

export interface UsuarioSesion {
  id_usuario: number;
  nombre: string;
  apellido: string;
  telefono?: string | null;
  correo: string;
  rol: string;
  estado: string;
}

export interface RegistroUsuario {
  nombre: string;
  apellido: string;
  telefono?: string;
  correo: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly usuario = signal<UsuarioSesion | null>(null);

  registrar(datos: RegistroUsuario): Observable<{ usuario: UsuarioSesion }> {
    return this.http.post<{ usuario: UsuarioSesion }>('/api/auth/registro', datos).pipe(tap(respuesta => this.guardarSesion(respuesta.usuario)));
  }

  iniciarSesion(correo: string, password: string): Observable<{ usuario: UsuarioSesion }> {
    return this.http.post<{ usuario: UsuarioSesion }>('/api/auth/login', { correo, password }).pipe(tap(respuesta => this.guardarSesion(respuesta.usuario)));
  }

  cerrarSesion(): void {
    this.usuario.set(null);
  }

  usuarioActual(): UsuarioSesion | null { return this.usuario(); }

  private guardarSesion(usuario: UsuarioSesion): void {
    this.usuario.set(usuario);
  }
}
