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

