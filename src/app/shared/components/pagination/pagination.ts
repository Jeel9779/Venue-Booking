// Purpose: Component/Logic: Handles UI behavior and user interactions for pagination.
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100 sm:px-6 rounded-b-[40px]">
      <!-- Mobile View -->
      <div class="flex justify-between flex-1 sm:hidden">
        <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 1"
          class="relative inline-flex items-center px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all">
          Previous
        </button>
        <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
          class="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all">
          Next
        </button>
      </div>

      <!-- Desktop View -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest">
            Showing <span class="text-indigo-600 font-black">{{ startIndex() }}</span> to 
            <span class="text-indigo-600 font-black">{{ endIndex() }}</span> of 
            <span class="text-slate-900 font-black">{{ totalRecords() }}</span> results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex -space-x-px rounded-2xl shadow-sm bg-slate-50/50 p-1 border border-slate-100" aria-label="Pagination">
            <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-xl text-slate-400 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer">
              <lucide-icon name="chevron-left" size="18"></lucide-icon>
            </button>
            
            @for (page of pages(); track page) {
              @if (page === -1) {
                <span class="relative inline-flex items-center px-4 py-2 text-sm font-black text-slate-300">...</span>
              } @else {
                <button (click)="changePage(page)"
                  [class]="page === currentPage() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:text-indigo-600'"
                  class="relative inline-flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all mx-0.5 cursor-pointer">
                  {{ page }}
                </button>
              }
            }

            <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
              class="relative inline-flex items-center px-2 py-2 rounded-xl text-slate-400 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer">
              <lucide-icon name="chevron-right" size="18"></lucide-icon>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    button:disabled { cursor: not-allowed; }
  `]
})
// Defines the structure and behavior of this class
export class Pagination {
  currentPage = input<number>(1);
  totalPages = input<number>(1);
  totalRecords = input<number>(0);
  limit = input<number>(10);
  
  onPageChange = output<number>();

  startIndex = computed(() => this.totalRecords() === 0 ? 0 : (this.currentPage() - 1) * this.limit() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.limit(), this.totalRecords()));
  
  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      // Always show first, last, and pages around current
      pages.push(1);
      
      if (current > 3) pages.push(-1); // Ellipsis
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (current < total - 2) pages.push(-1); // Ellipsis
      
      pages.push(total);
    }
    
    return pages;
  });

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.onPageChange.emit(page);
    }
  }
}
