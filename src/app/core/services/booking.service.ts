// Purpose: Service: Handles business logic and API communication for booking.
import { inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BookingApi } from '../api/booking-api';
import { BookingStore } from '../store/booking.store';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class BookingService {
  private readonly api = inject(BookingApi);
  private readonly store = inject(BookingStore);
  private readonly toast = inject(ToastService);

  loadAll(
    page: number = 1, 
    limit: number = 10, 
    search: string = '', 
    status: string = '',
    sortBy: string = '',
    sortOrder: string = '',
    startDate: string = '',
    endDate: string = ''
  ): void {
    this.store.setLoading(true);
    this.api.getAllBookings(page, limit, search, status, sortBy, sortOrder, startDate, endDate)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          // Determine bookings array and pagination metadata
          const bookings = Array.isArray(res) ? res : (res.data || res.bookings || []);
          this.store.setBookings(bookings);

          // If API did not provide pagination object, infer it
          if (Array.isArray(res)) {
            const totalRecords = bookings.length;
            const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
            this.store.setPagination({
              page,
              limit,
              totalRecords,
              totalPages,
            });
          } else {
            this.store.setPagination({
              page: res.page || page,
              limit: res.limit || limit,
              totalRecords: res.totalRecords || bookings.length,
              totalPages: res.totalPages || Math.max(1, Math.ceil((res.totalRecords || bookings.length) / (res.limit || limit)))
            });
          }
        },
        error: (err) => this.store.setError(err?.message || 'Failed to load bookings'),
      });
  }


  getStats() {
    return this.api.getStats();
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
        this.toast.error(err?.message || 'Failed to update booking status');
      },
    });
  }

  processRefund(id: string): void {
    const originalBookings = [...this.store.bookings()];
    // Optimsitic update
    const bookingToUpdate = originalBookings.find(b => b._id === id);
    if (bookingToUpdate && bookingToUpdate.cancellation) {
      this.store.optimisticUpdate(id, { 
        cancellation: { ...bookingToUpdate.cancellation, refundStatus: 'processed' } 
      });
    }

    // Default admin actor payload
    this.api.processRefund(id, { actorId: 'admin', actorType: 'admin' }).subscribe({
      next: (res) => {
        if (res.booking) {
          this.store.updateBooking(res.booking);
        }
        this.toast.success('Refund processed successfully');
      },
      error: (err) => {
        this.store.setBookings(originalBookings);
        this.store.setError(err?.error?.message || err?.message || 'Failed to process refund');
        this.toast.error(err?.error?.message || err?.message || 'Failed to process refund');
      }
    });
  }
}