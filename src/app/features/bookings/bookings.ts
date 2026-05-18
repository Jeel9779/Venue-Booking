import { Component, signal, computed, inject, ChangeDetectorRef, resource, effect } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BookingApi } from '../../core/api/booking-api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { BookingStore } from '../../core/store/booking.store';
import { Booking, BookingStats } from '../../core/models/booking.model';
import { LucideAngularModule } from 'lucide-angular';
import { Card } from '../../shared/components/card/card';
import { Button } from '../../shared/components/button/button';
import { Model } from '../../shared/components/model/model';
import { Pagination } from '../../shared/components/pagination/pagination';
import { initialPagination } from '../../core/models/pagination.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, Card, Button, Model, Pagination],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings {
  private readonly bookingService = inject(BookingService);
  private readonly bookingStore = inject(BookingStore);
  private readonly bookingApi = inject(BookingApi);
  private readonly cd = inject(ChangeDetectorRef);
  protected readonly Math = Math;

  ngOnInit() {
    this.bookingService.loadAll(this.pagination().page, this.pagination().limit);
  }

  onPageChange(page: number) {
    this.bookingService.loadAll(page, this.pagination().limit);
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

  /**
   * High-Performance Filtering Logic
   * Optimized to avoid redundant object creation (Dates, Strings) inside the loop.
   */
  filteredBookings = computed(() => {
    const list = this.bookings();
    const currentFilter = this.filter();
    const q = this.search().toLowerCase().trim();
    const dateRange = this.dateFilter();

    if (!q && currentFilter === 'all' && dateRange === 'allTime') {
      return list;
    }

    // Pre-calculate date-related constants OUTSIDE the filter loop
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayTime = today.getTime();
    
    let yesterdayTime = 0;
    let sevenDaysAgoTime = 0;

    if (dateRange === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterdayTime = yesterday.getTime();
    } else if (dateRange === 'last7days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgoTime = sevenDaysAgo.getTime();
    }

    const targetStatus = currentFilter === 'paid' ? 'success' : currentFilter;

    return list.filter(b => {
      // 1. Status Filter (Instant match)
      if (currentFilter !== 'all' && b.paymentStatus !== targetStatus) return false;

      // 2. Date Filter (Efficient timestamp comparison)
      if (dateRange !== 'allTime') {
        // Fast date extraction from ISO string (avoiding full Date object if possible)
        const bDate = new Date(b.date);
        const bookingTime = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()).getTime();

        if (dateRange === 'today' && bookingTime !== todayTime) return false;
        if (dateRange === 'yesterday' && bookingTime !== yesterdayTime) return false;
        if (dateRange === 'last7days' && bookingTime < sevenDaysAgoTime) return false;
      }

      // 3. Search Filter (Only run if search query exists)
      if (q) {
        return (
          b.userId.name.toLowerCase().includes(q) ||
          b.userId.email.toLowerCase().includes(q) ||
          b.userId.phone.toLowerCase().includes(q) ||
          b.venueId.name.toLowerCase().includes(q) ||
          b.vendorId.fullName.toLowerCase().includes(q) ||
          b.transactionId.toLowerCase().includes(q)
        );
      }

      return true;
    });
  });

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
   * Optimized KPI calculations in a single pass
   */
  stats = computed((): BookingStats => {
    const all = this.bookings();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const stats: BookingStats = {
      totalRevenue: 0,
      collected: 0,
      outstanding: 0,
      totalCount: all.length,
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
    this.bookingService.loadAll(this.pagination().page, this.pagination().limit);
  }
  setFilter(f: string) {
    this.filter.set(f);
  }

  private searchTimeout: any;
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    // Debounce search to prevent excessive signal updates
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search.set(input.value);
    }, 300);
  }

  setDateFilter(range: string) {
    this.dateFilter.set(range);
  }

  setPageSize(size: number) {
    this.bookingService.loadAll(1, size);
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

  formatCurrency(value: number): string {
    return Bookings.currencyFormatter.format(value || 0);
  }

  getStatusClass(status: string): string {
    const base = 'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center justify-center gap-1.5 w-fit';
    switch (status) {
      case 'success': return `${base} bg-emerald-50 text-emerald-600 border-emerald-200`;
      case 'pending':  return `${base} bg-amber-50 text-amber-600 border-amber-200`;
      case 'failed':   return `${base} bg-rose-50 text-rose-600 border-rose-200`;
      default:         return `${base} bg-slate-50 text-slate-600 border-slate-200`;
    }
  }

  dismissError() {
    this.bookingStore.setError(null);
  }
}