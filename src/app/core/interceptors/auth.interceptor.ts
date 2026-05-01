import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const adminId = localStorage.getItem('adminId');
  const vendorId = localStorage.getItem('vendorId');

  let cloned = req;

  // Add headers if they exist
  if (adminId || vendorId) {
    cloned = req.clone({
      setHeaders: {
        ...(adminId ? { 'adminid': adminId } : {}),
        ...(vendorId ? { 'vendorid': vendorId } : {})
      }
    });
  }

  return next(cloned);
};
