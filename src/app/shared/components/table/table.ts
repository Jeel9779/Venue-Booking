import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-slate-50/80">
            @for (col of columns(); track col) {
              <th
                class="px-5 py-4 text-left text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 whitespace-nowrap"
              >
                {{ col }}
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <ng-content></ng-content>
        </tbody>
      </table>
    </div>
  `,
})
export class Table {
  columns = input<string[]>([]);
}
