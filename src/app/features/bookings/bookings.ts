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

  private allBookingsForStats = signal<Booking[]>([]);

  ngOnInit() {
    this.bookingService.loadAll(this.pagination().page, this.pagination().limit, this.search(), this.filter());
    this.loadStats();
  }

  loadStats() {
    this.bookingApi.getAllBookings(1, 1000, this.search(), this.filter()).subscribe({
      next: (res) => {
        const all = Array.isArray(res) ? res : (res.data || res.bookings || []);
        this.allBookingsForStats.set(all);
      }
    });
  }

  onPageChange(page: number) {
    this.bookingService.loadAll(page, this.pagination().limit, this.search(), this.filter());
  }

  // ── State (Signals) ────────────────────────────────────────────────────────
  readonly bookings = this.bookingStore.bookings;
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
   * Optimized KPI calculations in a single pass (Current Page Stats)
   */
  stats = computed((): BookingStats => {
    const all = this.allBookingsForStats();
    const now = new Date();

    const stats: BookingStats = {
      totalRevenue: 0,
      collected: 0,
      outstanding: 0,
      totalCount: this.pagination().totalRecords || all.length,
      paidCount: 0,
      pendingCount: 0,
      failedCount: 0,
      todayCount: 0
    };

    for (const b of all) {
      const amount = b.totalBookingAmount || 0;
      const paid = b.amountPaid || 0;
      
      stats.totalRevenue += amount;
      stats.collected += paid;
      stats.outstanding += (amount - paid);

      if (b.paymentStatus === 'success') stats.paidCount++;
      else if (b.paymentStatus === 'pending') stats.pendingCount++;
      else if (b.paymentStatus === 'failed') stats.failedCount++;

      // Robust Today's Booking check
      const bDate = new Date(b.date);
      if (bDate.getFullYear() === now.getFullYear() && 
          bDate.getMonth() === now.getMonth() && 
          bDate.getDate() === now.getDate()) {
        stats.todayCount++;
      }
    }

    return stats;
  });

  // ── Actions ────────────────────────────────────────────────────────────────
  refresh() {
    this.bookingService.loadAll(this.pagination().page, this.pagination().limit, this.search(), this.filter());
  }
  
  setFilter(f: string) {
    this.filter.set(f);
    this.bookingService.loadAll(1, this.pagination().limit, this.search(), f);
    this.loadStats();
  }

  private searchTimeout: any;
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search.set(input.value);
      this.bookingService.loadAll(1, this.pagination().limit, input.value, this.filter());
      this.loadStats();
    }, 500);
  }

  setDateFilter(range: string) {
    this.dateFilter.set(range);
    // Note: Backend doesn't support dateFilter yet, but we prepare the UI state.
  }

  setPageSize(size: number) {
    this.bookingService.loadAll(1, size, this.search(), this.filter());
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