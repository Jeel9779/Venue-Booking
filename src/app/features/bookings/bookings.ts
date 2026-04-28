import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap, startWith, catchError, of } from 'rxjs';  // rxjs
import { BookingService, Booking } from '../../core/services/booking.service';  // booking servcice + interface

type SortField   = 'date' | 'cost' | 'createdAt';
type SortOrder   = 'asc' | 'desc';
type StatusFilter = 'all' | 'approved' | 'rejected' | 'pending';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule],   // FormsModule removed — no longer needed
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings {
  private bookingService = inject(BookingService);

  // ── Refresh trigger ───────────────────────────────────────────────────────
  // Emit on this to reload bookings (e.g. after status update)
  private refresh$ = new Subject<void>();

  // ── Async data (replaces manual subscribe + isLoading signal) ─────────────
  private bookingsData = toSignal(
    this.refresh$.pipe(
      startWith(undefined),
      switchMap(() =>
        this.bookingService.getAllBookings().pipe(
          catchError(err => {
            this.error.set(err?.message ?? 'Failed to load bookings. Please try again.');
            return of({ bookings: [] as Booking[] });
          })
        )
      )
    ),
    { initialValue: { bookings: [] as Booking[] } }
  );

  // ── UI State ──────────────────────────────────────────────────────────────
  error         = signal<string | null>(null);
  search        = signal('');
  statusFilter  = signal<StatusFilter>('all');
  sortBy        = signal<SortField>('createdAt');
  sortOrder     = signal<SortOrder>('desc');

  // Modal
  selectedBooking = signal<Booking | null>(null);
  showStatusModal = signal(false);
  newStatus       = signal<'approved' | 'rejected' | 'pending'>('approved');
  isSubmitting    = signal(false);

  // ── Computed (all auto-update when bookings() changes) ────────────────────
  bookings = computed(() => this.bookingsData()?.bookings ?? []);

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

  // Chart computeds — reactive, no manual computeCharts() call needed
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
    this.error.set(null);
    this.refresh$.next();
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
    this.isSubmitting.set(true);

    this.bookingService.updateBookingStatus(booking._id, this.newStatus()).subscribe({
      next: () => {
        this.closeStatusModal();
        this.isSubmitting.set(false);
        this.refresh$.next(); // triggers reactive reload via toSignal
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to update booking status.');
        this.isSubmitting.set(false);
      },
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

  // Safe percentage — guards division by zero (was showing NaN)
  pct(part: number, total: number): number {
    return total > 0 ? Math.round((part / total) * 100) : 0;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      rejected:  'bg-red-100 text-red-700 border-red-300',
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