import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { BookingService } from '../../core/services/booking.service';
import { BookingStore } from '../../core/store/booking.store';
import { Booking } from '../../core/models/booking.model';
import { FormsModule } from '@angular/forms';
import { Card } from '../../shared/components/card/card';
import { Table } from '../../shared/components/table/table';
import { Model } from '../../shared/components/model/model';
import { Button } from '../../shared/components/button/button';

type SortField   = 'date' | 'cost' | 'createdAt';
type SortOrder   = 'asc' | 'desc';
type StatusFilter = 'all' | 'approved' | 'rejected' | 'pending';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, Card, Table, Model, Button, TitleCasePipe],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly bookingStore = inject(BookingStore);

  // ── State from Store ──────────────────────────────────────────────────────
  readonly bookings = this.bookingStore.bookings;
  readonly isLoading = this.bookingStore.isLoading;
  readonly error = this.bookingStore.error;

  // ── UI State ──────────────────────────────────────────────────────────────
  search        = signal('');
  statusFilter  = signal<StatusFilter>('all');
  sortBy        = signal<SortField>('createdAt');
  sortOrder     = signal<SortOrder>('desc');

  // Modal State
  selectedBooking = signal<Booking | null>(null);
  showStatusModal = signal(false);
  newStatus       = signal<'approved' | 'rejected' | 'pending'>('approved');

  ngOnInit() {
    this.bookingService.loadAllBookings();
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  stats = computed(() => this.bookingService.calculateStats(this.bookings()));

  filteredBookings = computed(() => {
    let result = [...this.bookings()];
    const term = this.search().toLowerCase();

    if (term) {
      result = result.filter(b =>
        b.userId?.name?.toLowerCase().includes(term)   ||
        b.venueId?.name?.toLowerCase().includes(term)  ||
        b.vendorId?.name?.toLowerCase().includes(term) ||
        b.date?.includes(term)
      );
    }

    if (this.statusFilter() !== 'all') {
      result = result.filter(b => b.status === this.statusFilter());
    }

    return result.sort((a, b) => {
      const aVal = this.sortBy() === 'cost'
        ? Number(a.cost)
        : new Date(a[this.sortBy()]).getTime();
      const bVal = this.sortBy() === 'cost'
        ? Number(b.cost)
        : new Date(b[this.sortBy()]).getTime();
      return this.sortOrder() === 'asc' ? aVal - bVal : bVal - aVal;
    });
  });

  vendorRevenue = computed(() =>
    Object.entries(this.bookingService.getVendorRevenue(this.bookings()))
      .map(([vendor, revenue]) => ({ vendor, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  );

  venueBookings = computed(() =>
    Object.entries(this.bookingService.getVenueBookingCounts(this.bookings()))
      .map(([venue, count]) => ({ venue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  );

  monthlyRevenue = computed(() =>
    Object.entries(this.bookingService.getMonthlyRevenue(this.bookings()))
      .sort()
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-12)
  );

  // ── Methods ───────────────────────────────────────────────────────────────
  retry() {
    this.bookingService.loadAllBookings();
  }

  onSearchInput(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
  }

  openStatusModal(booking: Booking) {
    this.selectedBooking.set(booking);
    this.newStatus.set(booking.status);
    this.showStatusModal.set(true);
  }

  closeStatusModal() {
    this.showStatusModal.set(false);
    this.selectedBooking.set(null);
  }

  submitStatusUpdate() {
    const booking = this.selectedBooking();
    if (!booking) return;

    this.bookingService.updateBookingStatus(booking._id, this.newStatus(), () => {
      this.closeStatusModal();
    });
  }

  toggleSort(field: SortField) {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
  }

  pct(part: number, total: number): number {
    return total > 0 ? Math.round((part / total) * 100) : 0;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      rejected:  'bg-rose-100 text-rose-700 border-rose-300',
      pending:   'bg-amber-100 text-amber-700 border-amber-300',
    };
    return map[status] ?? 'bg-slate-100 text-slate-700 border-slate-300';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }
}