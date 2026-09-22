import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const esPersonalInstitucional = (rol: string): boolean =>
  rol === 'ADMIN' || rol === 'OPERATOR' || rol === 'OPERADOR';

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.usuarioActual();

  if (!usuario) return true;
  return router.createUrlTree([esPersonalInstitucional(usuario.rol) ? '/admin' : '/usuario']);
};

export const usuarioGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.usuarioActual();

  return usuario?.rol === 'CIUDADANO'
    ? true
    : router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.usuarioActual();

  return esPersonalInstitucional(usuario?.rol ?? '')
    ? true
    : router.createUrlTree(['/login']);
};
