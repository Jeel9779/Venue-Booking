import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      @if (title()) {
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-800 m-0">{{ title() }}</h3>
          <ng-content select="[header-actions]"></ng-content>
        </div>
      }
      <div [class]="padding() ? 'p-6' : ''">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class Card {
  title = input('');
  padding = input(true);
  hover = input(true);
  customClass = input('');

  cardClasses = computed(() => {
    return `
      bg-white rounded-[24px] shadow-sm border border-slate-300 overflow-hidden
      ${this.hover() ? 'transition-all duration-200 hover:shadow-lg hover:border-indigo-200' : ''}
      ${this.customClass()}
    `.trim();
  });
}
