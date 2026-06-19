// Purpose: Component/Logic: Handles UI behavior and user interactions for bookings.
import { Component, inject, ChangeDetectorRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Card } from '../../shared/components/card/card';
import { Button } from '../../shared/components/button/button';
import { Model } from '../../shared/components/model/model';
import { Pagination } from '../../shared/components/pagination/pagination';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

import { BookingService } from '../../core/services/booking.service';
import { BookingStore } from '../../core/store/booking.store';
import { BookingApi } from '../../core/api/booking-api';
import { Booking, BookingStats } from '../../core/models/booking.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, Card, Button, Model, Pagination, LoadingSpinnerComponent],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
// Defines the structure and behavior of this class
export class Bookings {
  private readonly bookingService = inject(BookingService);
  private readonly bookingStore = inject(BookingStore);
  private readonly bookingApi = inject(BookingApi);
  private readonly cd = inject(ChangeDetectorRef);
  protected readonly Math = Math;

  // We will store the KPI stats in a signal to be updated from backend
  private backendStats = signal<BookingStats>({
    totalRevenue: 0,
    collected: 0,
    outstanding: 0,
    totalCount: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
    todayCount: 0
  });

  // Track sorting
  sortBy = signal<string>('createdAt');
  sortOrder = signal<string>('desc');

  ngOnInit() {
    this.refresh();
  }

  loadStats() {
    this.bookingService.getStats().subscribe({
      next: (res) => {
        this.backendStats.set({
          totalRevenue: res.totalRevenue || 0,
          collected: res.collected || 0,
          outstanding: res.outstanding || 0,
          totalCount: this.pagination().totalRecords || 0,
          paidCount: 0, // Backend might not provide this yet, but we use what we have
          pendingCount: 0,
          failedCount: 0,
          todayCount: res.todayCount || 0
        });
      }
    });
  }

  onPageChange(page: number) {
    this.fetchData(page);
  }

  // ── State (Signals) ────────────────────────────────────────────────────────
  readonly rawBookings = this.bookingStore.bookings;
  
  readonly bookings = computed(() => {
    return this.rawBookings();
  });
  // Use store signals for loading and error states
  readonly isLoading = this.bookingStore.isLoading;
  readonly error = this.bookingStore.error;

  search = signal('');
  filter = signal<string>('all');
  dateFilter = signal<string>('allTime');

  readonly pagination = this.bookingStore.pagination;

  selectedBooking = signal<Booking | null>(null);
  // Controls which tab is active in the booking detail modal:
  // 'booking' = Booking & Customer Info | 'payment' = Payment Details
  modalTab = signal<'booking' | 'payment'>('booking');

  // Moderation state (Aligned with Vendor pattern)
  showApproveModel = signal(false);
  showRejectModel = signal(false);
  rejectReason = signal('');

  // Memoized Formatter to avoid expensive recreation
  private static readonly currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });

  // ── High-Performance Filtering Logic (Server-Side) ─────────────────────────
  // Replaced with server-side API calls to prevent client-side bottleneck
  
  totalPages = computed(() => this.pagination().totalPages);

  pages = computed(() => {
    const total = this.pagination().totalPages;
    const current = this.pagination().page;
    const maxVisible = 5;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > total) {
      end = total;
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  /**
   * Stats directly read from backend
   */
  stats = this.backendStats.asReadonly();

  // ── Actions ────────────────────────────────────────────────────────────────
  
  private fetchData(page: number = 1) {
    let startDate = '';
    let endDate = '';
    
    // Convert dateFilter into start/end dates
    const now = new Date();
    if (this.dateFilter() === 'today') {
      startDate = new Date(now.setHours(0,0,0,0)).toISOString();
      endDate = new Date(now.setHours(23,59,59,999)).toISOString();
    } else if (this.dateFilter() === 'thisWeek') {
      const first = now.getDate() - now.getDay();
      startDate = new Date(now.setDate(first)).toISOString();
    } else if (this.dateFilter() === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    this.bookingService.loadAll(
      page, 
      this.pagination().limit || 10, 
      this.search(), 
      this.filter(),
      this.sortBy(),
      this.sortOrder(),
      startDate,
      endDate
    );
    this.loadStats();
  }

  refresh() {
    this.fetchData(this.pagination().page);
  }
  
  setFilter(f: string) {
    this.filter.set(f);
    this.fetchData(1);
  }

  toggleSort(field: string) {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
    this.fetchData(1);
  }

  private searchTimeout: any;
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search.set(input.value);
      this.fetchData(1);
    }, 400); // 400ms debounce
  }

  setDateFilter(range: string) {
    this.dateFilter.set(range);
    this.fetchData(1);
  }

  setPageSize(size: number) {
    // Modify pagination limit in store directly or just pass to loadAll (which sets it)
    this.bookingService.loadAll(1, size, this.search(), this.filter(), this.sortBy(), this.sortOrder());
    this.loadStats();
  }

  openDetails(booking: Booking) {
    this.modalTab.set('booking');
    this.selectedBooking.set(booking);
    
    // Force immediate change detection to ensure modal content renders instantly
    this.cd.detectChanges();
    
    console.log('Modal opened with booking:', booking);
  }

  closeDetails() {
    this.selectedBooking.set(null);
    this.showApproveModel.set(false);
    this.showRejectModel.set(false);
  }

  // ── Moderation Actions (Optimistic) ────────────────────────────────────────
  
  openApprove() {
    this.showApproveModel.set(true);
  }

  submitApprove() {
    const b = this.selectedBooking();
    if (!b) return;
    this.bookingService.updateStatus(b._id, 'success');
    this.closeDetails();
  }

  openReject() {
    this.rejectReason.set('');
    this.showRejectModel.set(true);
  }

  submitReject() {
    const b = this.selectedBooking();
    if (!b) return;
    this.bookingService.updateStatus(b._id, 'failed');
    this.closeDetails();
  }

  processRefund() {
    const b = this.selectedBooking();
    if (!b) return;
    
    // Simple browser confirm for safety
    if (confirm(`Are you sure you want to process a refund of ${this.formatCurrency(b.cancellation?.refundAmount || 0)} for this booking?`)) {
      this.bookingService.processRefund(b._id);
    }
  }

  formatCurrency(value: number): string {
    return Bookings.currencyFormatter.format(value || 0);
  }

  getStatusClass(status: string): string {
    const base = 'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center justify-center gap-1.5 w-fit';
    switch (status) {
      case 'success': return `${base} bg-emerald-50 text-emerald-600 border-emerald-200`;
      case 'pending':  return `${base} bg-amber-50 text-amber-600 border-amber-200`;
      case 'failed':
      case 'cancelled':
        return `${base} bg-red-50 text-red-600 border-red-200`;
      default:         return `${base} bg-slate-50 text-slate-600 border-slate-200`;
    }
  }

  dismissError() {
    this.bookingStore.setError(null);
  }
}