import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="onClick.emit($event)"
      [class]="buttonClasses"
    >
      @if (loading()) {
        <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
  `]
})
export class Button {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'danger' | 'ghost' | 'success'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input(false);
  loading = input(false);
  fullWidth = input(false);
  customClass = input('');

  onClick = output<MouseEvent>();

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-100',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-100',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-100'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-[0.8125rem]',
      lg: 'px-6 py-3 text-base'
    };

    return `
      ${baseClasses} 
      ${variants[this.variant()]} 
      ${sizes[this.size()]} 
      ${this.fullWidth() ? 'w-full' : ''} 
      ${this.customClass()}
    `.trim();
  }
}
