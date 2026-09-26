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

interface RespuestaSesion {
  usuario: UsuarioSesion;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly usuario = signal<UsuarioSesion | null>(this.leerUsuario());
  private readonly token = signal<string | null>(this.leerToken());

  registrar(datos: RegistroUsuario): Observable<RespuestaSesion> {
    return this.http.post<RespuestaSesion>('/api/auth/registro', datos).pipe(tap(respuesta => this.guardarSesion(respuesta)));
  }

  iniciarSesion(correo: string, password: string): Observable<RespuestaSesion> {
    return this.http.post<RespuestaSesion>('/api/auth/login', { correo, password }).pipe(tap(respuesta => this.guardarSesion(respuesta)));
  }

  cerrarSesion(): void {
    this.usuario.set(null);
    this.token.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('offlineaid_usuario');
      localStorage.removeItem('offlineaid_token');
    }
  }

  usuarioActual(): UsuarioSesion | null { return this.usuario(); }
  tokenActual(): string | null { return this.token(); }

  private guardarSesion(respuesta: RespuestaSesion): void {
    this.usuario.set(respuesta.usuario);
    this.token.set(respuesta.token);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('offlineaid_usuario', JSON.stringify(respuesta.usuario));
      localStorage.setItem('offlineaid_token', respuesta.token);
    }
  }

  private leerUsuario(): UsuarioSesion | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('offlineaid_usuario') ?? 'null') as UsuarioSesion | null;
    } catch {
      return null;
    }
  }

  private leerToken(): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem('offlineaid_token');
  }
}
