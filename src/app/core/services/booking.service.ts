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

  loadAll(page: number = 1, limit: number = 10): void {
    this.store.setLoading(true);
    this.api.getAllBookings(page, limit)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          const bookings = Array.isArray(res) ? res : (res.data || res.bookings || []);
          this.store.setBookings(bookings);

          if (!Array.isArray(res)) {
            this.store.setPagination({
              page: res.page || page,
              limit: res.limit || limit,
              totalRecords: res.totalRecords || bookings.length,
              totalPages: res.totalPages || 1
            });
          }
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