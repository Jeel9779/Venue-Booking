import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { BookingService } from '../../core/services/booking.service';
import { BookingStore } from '../../core/store/booking.store';
import { Booking } from '../../core/models/booking.model';
import { VendorSubscriptionServices } from '../../core/services/vendor-subscription.service';
import { FormsModule } from '@angular/forms';
import { Card } from '../../shared/components/card/card';
import { Table } from '../../shared/components/table/table';
import { Model } from '../../shared/components/model/model';
import { Button } from '../../shared/components/button/button';

type SortField   = 'date' | 'cost' | 'createdAt';
type SortOrder   = 'asc' | 'desc';
type StatusFilter = 'all' | 'approved' | 'rejected';
type TimeFilter   = 'all' | 'today' | 'upcoming' | 'past';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, Card, Model, Button, TitleCasePipe],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly bookingStore = inject(BookingStore);
  private readonly subService = inject(VendorSubscriptionServices);

  // ── State from Store ──────────────────────────────────────────────────────
  readonly bookings = this.bookingStore.bookings;
  readonly isLoading = this.bookingStore.isLoading;
  readonly error = this.bookingStore.error;

  // ── Local State for Earnings ──────────────────────────────────────────────
  allSubscriptions = signal<any[]>([]);
  adminEarnings = computed(() => {
    const subs = this.allSubscriptions();
    const time = this.timeFilter();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return subs
      .filter(s => s.status === 'active' || s.paymentStatus === 'approved')
      .filter(s => {
        if (time === 'all') return true;
        const sDate = new Date(s.createdAt || s.requestedAt);
        sDate.setHours(0, 0, 0, 0);
        
        if (time === 'today') return sDate.toDateString() === today.toDateString();
        if (time === 'upcoming') return sDate >= today;
        if (time === 'past') return sDate < today;
        return true;
      })
      .reduce((sum, s) => sum + (s.amount || 0), 0);
  });

  revenueByPlan = computed(() => {
    const subs = this.allSubscriptions().filter(s => s.status === 'active' || s.paymentStatus === 'approved');
    const data: Record<string, number> = {};
    
    subs.forEach(s => {
      const name = s.planName || 'Unknown Plan';
      data[name] = (data[name] || 0) + (s.amount || 0);
    });

    return Object.entries(data)
      .map(([plan, revenue]) => ({ plan, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  });

  // ── UI State ──────────────────────────────────────────────────────────────
  search        = signal('');
  statusFilter  = signal<StatusFilter>('all');
  timeFilter    = signal<TimeFilter>('all');
  sortBy        = signal<SortField>('createdAt');
  sortOrder     = signal<SortOrder>('desc');

  // Modal State
  selectedBooking = signal<Booking | null>(null);
  showDetailsModal = signal(false);

  ngOnInit() {
    this.bookingService.loadAllBookings();
    this.loadAdminEarnings();
  }

  loadAdminEarnings() {
    this.subService.getAll().subscribe({
      next: (subs) => {
        this.allSubscriptions.set(subs);
      },
      error: (err) => console.error('Failed to load earnings:', err)
    });
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  stats = computed(() => this.bookingService.calculateStats(this.bookings()));

  filteredBookings = computed(() => {
    let result = [...this.bookings()];
    const term = this.search().toLowerCase();

    if (term) {
      result = result.filter(b =>
        b.userId?.name?.toLowerCase().includes(term) ||
        b.userId?.email?.toLowerCase().includes(term) ||
        b.userId?.phone?.includes(term) ||
        b.venueId?.name?.toLowerCase().includes(term) ||
        b.venueId?.city?.toLowerCase().includes(term) ||
        b.vendorId?.businessName?.toLowerCase().includes(term) ||
        b.vendorId?.fullName?.toLowerCase().includes(term) ||
        b.status?.toLowerCase().includes(term) ||
        b.date?.includes(term) ||
        String(b.cost).includes(term)
      );
    }

    if (this.statusFilter() !== 'all') {
      result = result.filter(b => b.status === this.statusFilter());
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.timeFilter() === 'today') {
      result = result.filter(b => new Date(b.date).toDateString() === today.toDateString());
    } else if (this.timeFilter() === 'upcoming') {
      result = result.filter(b => new Date(b.date) >= today);
    } else if (this.timeFilter() === 'past') {
      result = result.filter(b => new Date(b.date) < today);
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

  openDetails(booking: Booking) {
    this.selectedBooking.set(booking);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedBooking.set(null);
  }

  cancelBooking(id: string) {
    if (confirm('Are you sure you want to force cancel this booking? This action cannot be undone.')) {
      this.bookingService.updateBookingStatus(id, 'rejected', () => {
        this.closeDetailsModal();
      });
    }
  }

  exportData() {
    alert('Generating booking report (CSV)...');
    // Implementation for CSV export would go here
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