/* import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
}; */

/* import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = (p0: unknown) => {

  const router = inject(Router);

  const admin = localStorage.getItem('admin');

  if (admin) {
    return true;
  }

  
  return router.parseUrl('/login'); 
};  */

import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);

  // 🔥 FIX HERE
  const adminId = localStorage.getItem('adminId');

  if (adminId) {
    return true;
  }

  return router.parseUrl('/login');
};

