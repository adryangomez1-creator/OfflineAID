import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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

  return usuario?.rol === 'ADMIN' || usuario?.rol === 'OPERATOR' || usuario?.rol === 'OPERADOR'
    ? true
    : router.createUrlTree(['/login']);
};
