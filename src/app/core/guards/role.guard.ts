/* import { CanActivateFn } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  return true;
};
 */
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const roleGuard = (allowedRoles: string[]) => {

  const router = inject(Router);

  const user = JSON.parse(localStorage.getItem('admin') || '{}');

  if (!user || !user.role) {
    router.navigate(['/login']);
    return false;
  }

  // ✅ CHECK ROLE
  if (allowedRoles.includes(user.role)) {
    return true;
  }

  // ❌ NOT ALLOWED
  router.navigate(['/login']);
  return false;
};


