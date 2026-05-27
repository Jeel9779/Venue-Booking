// Purpose: Service: Handles business logic and API communication for toast.
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

// Defines the data model structure
export interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
// Defines the structure and behavior of this class
export class ToastService {
  toasts = signal<Toast[]>([]);
  private idCounter = 0;

  show(message: string, type: ToastType = 'info', duration: number = 4000) {
    const id = this.idCounter++;
    this.toasts.update(t => [...t, { message, type, id }]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
