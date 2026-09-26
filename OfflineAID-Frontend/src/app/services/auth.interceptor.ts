import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.tokenActual();
  if (!token || request.url.includes('/api/auth/')) return next(request);

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  })).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      auth.cerrarSesion();
      void router.navigateByUrl('/login');
    }
    return throwError(() => error);
  }));
};