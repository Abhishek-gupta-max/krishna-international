import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminRole } from '../models/domain.models';
import { AuthService } from '../services/auth.service';

/** Requires a valid admin session. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) return true;
  return inject(Router).createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};

/** Redirects an already signed-in admin away from the login page. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/admin/dashboard']) : true;
};

/** Restricts a route to specific roles: `canActivate: [roleGuard('super_admin', 'admin')]`. */
export const roleGuard =
  (...roles: AdminRole[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    return auth.hasRole(...roles) ? true : inject(Router).createUrlTree(['/admin/dashboard']);
  };
