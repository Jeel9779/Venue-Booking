import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-full px-4">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="flex items-center w-full max-w-sm p-4 bg-white rounded-xl shadow-2xl border-l-4 pointer-events-auto transition-all duration-300 ease-in-out transform origin-top"
          [ngClass]="{
            'border-green-500 text-green-800': toast.type === 'success',
            'border-red-500 text-red-800': toast.type === 'error',
            'border-blue-500 text-blue-800': toast.type === 'info'
          }"
          role="alert"
          style="animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;">
          
          <!-- Icon -->
          <div class="inline-flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg mr-3"
               [ngClass]="{
                 'text-green-600 bg-green-100': toast.type === 'success',
                 'text-red-600 bg-red-100': toast.type === 'error',
                 'text-blue-600 bg-blue-100': toast.type === 'info'
               }">
            @if (toast.type === 'success') {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            } @else if (toast.type === 'error') {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            }
          </div>
          
          <!-- Message -->
          <div class="text-sm font-semibold flex-1 mr-2">{{ toast.message }}</div>
          
          <!-- Close Button -->
          <button type="button" (click)="toastService.remove(toast.id)" class="bg-transparent text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 transition-colors" aria-label="Close">
            <span class="sr-only">Close</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideDown {
      0% { transform: translateY(-100%) scale(0.9); opacity: 0; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
