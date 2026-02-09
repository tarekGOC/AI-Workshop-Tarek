import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.authenticated()) {
    auth.login();
    return false;
  }
  return true;
};

export const providerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.authenticated()) {
    auth.login();
    return false;
  }
  if (!auth.isProvider()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};

export const customerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.authenticated()) {
    auth.login();
    return false;
  }
  if (!auth.isCustomer()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
