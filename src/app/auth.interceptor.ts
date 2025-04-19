import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { SessionService } from './services/session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwtToken');
  const router = inject(Router);
  const sessionService = inject(SessionService);

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      const isTokenExpired =
        error.status === 401 &&
        (error.error?.message?.includes('expired') || error.error === 'Token expired, please login again.');

      if (isTokenExpired) {
        sessionService.logout('Session expired. Please login again.');
      }

      return throwError(() => error);
    })
  );
};
