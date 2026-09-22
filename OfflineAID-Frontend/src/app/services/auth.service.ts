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
  private readonly claveSesion = 'offlineaid.usuario';
  readonly usuario = signal<UsuarioSesion | null>(this.leerSesion());

  registrar(datos: RegistroUsuario): Observable<{ usuario: UsuarioSesion }> {
    return this.http.post<{ usuario: UsuarioSesion }>('/api/auth/registro', datos).pipe(tap(respuesta => this.guardarSesion(respuesta.usuario)));
  }

  iniciarSesion(correo: string, password: string): Observable<{ usuario: UsuarioSesion }> {
    return this.http.post<{ usuario: UsuarioSesion }>('/api/auth/login', { correo, password }).pipe(tap(respuesta => this.guardarSesion(respuesta.usuario)));
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.claveSesion);
    this.usuario.set(null);
  }

  usuarioActual(): UsuarioSesion | null { return this.usuario(); }

  private guardarSesion(usuario: UsuarioSesion): void {
    localStorage.setItem(this.claveSesion, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  private leerSesion(): UsuarioSesion | null {
    try { return JSON.parse(localStorage.getItem(this.claveSesion) ?? 'null'); } catch { return null; }
  }
}
