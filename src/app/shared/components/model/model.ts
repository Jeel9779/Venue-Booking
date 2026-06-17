// Purpose: Model: Defines data structures and types for the application.
import { Component, input, output, computed, inject, ElementRef, Renderer2, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalManagerService } from '../../../core/services/modal-manager.service';

@Component({
  selector: 'app-model',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="'fixed inset-0 flex items-center justify-center p-4 animate-[fadeIn_0.18s_ease] ' + backdropClass()"
      [style.z-index]="zIndex()"
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
        <div class="overflow-y-auto p-6 flex-1 scrollbar-hide">
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
  `]
})
export class Model implements OnInit, OnDestroy {
  title = input('');
  maxWidth = input<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');
  hasFooter = input(false);

  onClose = output<void>();

  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly modalManager = inject(ModalManagerService);

  // Dynamically assigned z-index from the manager
  zIndex = signal(9999);
  
  // Track if this is the first active modal for backdrop styling
  isFirstModal = signal(true);

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

  backdropClass = computed(() => {
    // Base dark overlay
    let base = 'bg-slate-900/55';
    // The user requested that the previous modal is also blurred when a nested modal opens.
    if (this.isFirstModal()) {
      base += ' backdrop-blur-md';
    } else {
      // Use a slightly darker overlay with a blur effect to blur the parent modal
      base = 'bg-slate-900/65 backdrop-blur-sm'; 
    }
    return base;
  });

  ngOnInit() {
    // 1. Move this component's DOM element directly to the body
    // This escapes any parent overflow: hidden, relative positioning, or localized z-index stacking contexts
    this.renderer.appendChild(document.body, this.elementRef.nativeElement);

    // 2. Register with the manager to lock scroll and get a proper z-index
    const newZIndex = this.modalManager.registerModal();
    this.zIndex.set(newZIndex);
    
    // If it's the base z-index, it's the first modal
    this.isFirstModal.set(newZIndex === 9999);
  }

  ngOnDestroy() {
    // 1. Unregister to unlock scroll if necessary
    this.modalManager.unregisterModal();

    // 2. Remove the element from the DOM to prevent memory/DOM leaks
    if (this.elementRef.nativeElement && this.elementRef.nativeElement.parentNode) {
      this.renderer.removeChild(document.body, this.elementRef.nativeElement);
    }
  }
}
