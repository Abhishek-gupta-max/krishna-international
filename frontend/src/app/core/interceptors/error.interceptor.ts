import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AppError } from '../models/api.models';
import { AuthService } from '../services/auth.service';

/**
 * Converts HTTP failures into a predictable AppError and signs the admin out
 * when an authenticated request is rejected with 401.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) return throwError(() => err);

      let message = err.error?.message as string | undefined;
      if (err.status === 0) message = 'Unable to reach the server. Please check your internet connection and try again.';
      if (!message && err.error instanceof Blob) message = 'The file could not be downloaded.';
      if (!message) message = err.status >= 500 ? 'Something went wrong on our side. Please try again shortly.' : 'The request could not be completed.';

      if (err.status === 401 && req.headers.has('Authorization')) {
        auth.clearSession();
        router.navigate(['/admin/login'], { queryParams: { expired: 1, returnUrl: router.url } });
      }

      const appError: AppError = { status: err.status, message, errors: err.error?.errors };
      return throwError(() => appError);
    })
  );
};
