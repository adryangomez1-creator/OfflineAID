import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  modo: 'login' | 'registro' = 'login';
  cargando = false;
  error = '';

  readonly loginForm = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  readonly registroForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.maxLength(20)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', [Validators.required]]
  });

  cambiarModo(modo: 'login' | 'registro'): void {
    this.modo = modo;
    this.error = '';
  }

  iniciarSesion(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.cargando = true;
    this.error = '';
    const { correo, password } = this.loginForm.getRawValue();
    this.auth.iniciarSesion(correo, password).pipe(timeout(10_000), finalize(() => this.cargando = false)).subscribe({
      next: ({ usuario }) => this.router.navigateByUrl(this.esPersonalInstitucional(usuario.rol) ? '/admin' : '/usuario'),
      error: (respuesta: { error?: { error?: string } }) => {
        this.error = respuesta.error?.error ?? 'No fue posible iniciar sesión. Verifica que el backend esté disponible.';
        this.loginForm.controls.password.reset();
      }
    });
  }

  registrar(): void {
    if (this.registroForm.invalid) { this.registroForm.markAllAsTouched(); return; }
    const { confirmarPassword, ...datos } = this.registroForm.getRawValue();
    if (datos.password !== confirmarPassword) { this.error = 'Las contraseñas no coinciden.'; return; }
    this.cargando = true;
    this.error = '';
    this.auth.registrar(datos).pipe(timeout(10_000), finalize(() => this.cargando = false)).subscribe({
      next: ({ usuario }) => this.router.navigateByUrl(this.esPersonalInstitucional(usuario.rol) ? '/admin' : '/usuario'),
      error: ({ error }) => { this.error = error?.error ?? 'No fue posible crear la cuenta. Verifica que el backend esté disponible.'; }
    });
  }

  private esPersonalInstitucional(rol: string): boolean {
    return rol === 'ADMIN' || rol === 'OPERADOR';
  }
}
