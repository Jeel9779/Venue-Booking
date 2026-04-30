import { Component, input, forwardRef, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-group w-full">
      @if (label()) {
        <label [for]="id()" class="block text-[0.8125rem] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{{ label() }}</label>
      }
      <div class="relative">
        @if (type() === 'textarea') {
          <textarea
            [id]="id()"
            [(ngModel)]="value"
            (ngModelChange)="onModelChange($event)"
            (blur)="onTouched()"
            [placeholder]="placeholder()"
            [rows]="rows()"
            [class]="inputClasses + ' p-3 min-h-[100px]'"
          ></textarea>
        } @else {
          <input
            [id]="id()"
            [type]="type()"
            [(ngModel)]="value"
            (ngModelChange)="onModelChange($event)"
            (blur)="onTouched()"
            [placeholder]="placeholder()"
            [class]="inputClasses + ' h-11 px-4'"
          />
        }
      </div>
      @if (error()) {
        <p class="mt-1.5 text-[0.7rem] font-bold text-rose-500 uppercase tracking-tight flex items-center gap-1 animate-[fadeIn_0.2s_ease]">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
          {{ error() }}
        </p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInput),
      multi: true,
    },
  ],
})
export class FormInput implements ControlValueAccessor {
  label = input('');
  placeholder = input('');
  type = input<'text' | 'number' | 'email' | 'password' | 'textarea'>('text');
  id = input('input-' + Math.random().toString(36).substring(2, 9));
  rows = input(3);
  error = input<string | null>(null);

  get inputClasses(): string {
    const base = 'w-full rounded-xl text-sm text-slate-900 outline-none transition box-border placeholder:text-slate-400 shadow-sm ring-1';
    const normal = 'border border-slate-300 bg-white ring-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';
    const errorState = 'border-rose-400 bg-rose-50/30 ring-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10';
    
    return `${base} ${this.error() ? errorState : normal}`;
  }

  value: any = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onModelChange(val: any) {
    this.value = val;
    this.onChange(val);
  }
}
