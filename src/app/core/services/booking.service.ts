import { inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BookingApi } from '../api/booking-api';
import { BookingStore } from '../store/booking.store';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly api = inject(BookingApi);
  private readonly store = inject(BookingStore);

  loadAll(): void {
    this.store.setLoading(true);
    this.api.getAllBookings()
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          const data = Array.isArray(res) ? res : (res.bookings || []);
          this.store.setBookings(data);
        },
        error: (err) => this.store.setError(err?.message || 'Failed to load bookings'),
      });
  }

  updateStatus(id: string, status: 'pending' | 'success' | 'failed'): void {
    // ⚡ OPTIMISTIC: Update UI immediately
    const originalBookings = [...this.store.bookings()];
    // Note: status here refers to paymentStatus in booking model
    this.store.optimisticUpdate(id, { paymentStatus: status });

    this.api.updateBookingStatus(id, status === 'success' ? 'approved' : 'rejected').subscribe({
      next: (res) => this.store.updateBooking(res.booking),
      error: (err) => {
        // Rollback on error
        this.store.setBookings(originalBookings);
        this.store.setError(err?.message || 'Failed to update booking status');
      },
    });
  }
}