import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-model',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[9999] bg-slate-900/55 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.18s_ease]"
      (click)="onClose.emit()"
    >
      <div
        [class]="'w-full max-h-[90vh] bg-white rounded-[24px] shadow-2xl border border-slate-200/60 flex flex-col overflow-hidden animate-[slideUp_0.22s_ease] ' + maxWidthClass()"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between gap-4 px-6 py-[18px] border-b border-slate-200 shrink-0">
          <h2 class="text-lg font-bold text-slate-900 m-0">{{ title() }}</h2>
          <button
            class="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg text-slate-400 cursor-pointer transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close model"
            (click)="onClose.emit()"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto p-6 flex-1 no-scrollbar">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        @if (hasFooter()) {
          <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
            <ng-content select="[footer]"></ng-content>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class Model {
  title = input('');
  maxWidth = input<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');
  hasFooter = input(false);

  onClose = output<void>();

  maxWidthClass = computed(() => {
    const widths = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      '2xl': 'max-w-6xl'
    };
    return widths[this.maxWidth()];
  });
}
