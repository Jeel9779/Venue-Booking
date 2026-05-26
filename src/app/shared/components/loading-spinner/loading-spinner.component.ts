// src/app/shared/components/loading-spinner/loading-spinner.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable loading spinner.
 * @param size - 'sm' | 'md' | 'lg' (controls width/height)
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [ngClass]="sizeClass"
      class="animate-spin text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      role="status"
      aria-live="polite"
    >
      <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
      <path d="M4 12a8 8 0 018-8"></path>
    </svg>
  `,
  styles: [
    `.sm { width: 1rem; height: 1rem; }`,
    `.md { width: 1.5rem; height: 1.5rem; }`,
    `.lg { width: 2rem; height: 2rem; }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  /** Size of the spinner – defaults to md */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get sizeClass(): string {
    return this.size;
  }
}
