// Purpose: Interceptor: Intercepts HTTP requests/responses for error.
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check your connection or try again later.';
        } else {
          errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }
      
      // console.error removed - using toast service for notifications
      toastService.error(errorMessage);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
