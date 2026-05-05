import { inject, Injectable } from '@angular/core';
import { BookingApi } from '../api/booking-api';
import { BookingStore } from '../store/booking.store';
import { Booking, BookingStats } from '../models/booking.model';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly api = inject(BookingApi);
  private readonly store = inject(BookingStore);

  loadAllBookings() {
    this.store.setLoading(true);
    this.store.setError(null);
    this.api.getAllBookings()
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => this.store.setBookings(res.bookings || []),
        error: (err) => {
          console.error(err);
          this.store.setError(err.error?.message || 'Failed to load bookings.');
        }
      });
  }

  updateBookingStatus(bookingId: string, status: 'approved' | 'rejected', callback?: () => void) {
    this.store.setLoading(true);
    this.api.updateBookingStatus(bookingId, status)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.store.updateBooking(res.booking);
          if (callback) callback();
        },
        error: (err) => this.store.setError(err.error?.message || 'Failed to update booking status.')
      });
  }

  calculateStats(bookings: Booking[]): BookingStats {
    const total = bookings.length;
    const approvedCount = bookings.filter(b => b.status === 'approved').length;
    const rejectedCount = bookings.filter(b => b.status === 'rejected').length;

    return {
      totalBookings: total,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.status === 'approved' ? b.cost : 0), 0),
      approvedCount,
      rejectedCount,
      approvalRate: total > 0 ? Math.round((approvedCount / total) * 100) : 0,
    };
  }

  getMonthlyRevenue(bookings: Booking[]) {
    const monthlyData: { [key: string]: number } = {};
    bookings.forEach(b => {
      if (b.status === 'approved') {
        const date = new Date(b.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + b.cost;
      }
    });
    return monthlyData;
  }

  getVendorRevenue(bookings: Booking[]) {
    const vendorData: { [key: string]: number } = {};
    bookings.forEach(b => {
      if (b.status === 'approved') {
        const vendorName = b.vendorId?.businessName || b.vendorId?.fullName || 'Unknown';
        vendorData[vendorName] = (vendorData[vendorName] || 0) + b.cost;
      }
    });
    return vendorData;
  }

  getVenueBookingCounts(bookings: Booking[]) {
    const venueData: { [key: string]: number } = {};
    bookings.forEach(b => {
      const venueName = b.venueId?.name || 'Unknown';
      venueData[venueName] = (venueData[venueName] || 0) + 1;
    });
    return venueData;
  }
}