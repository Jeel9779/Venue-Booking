import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, of } from 'rxjs';

export interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  vendorId: {
    _id: string;
    name: string;
  };
  venueId: {
    _id: string;
    name: string;
    location: string;
  };
  date: string;
  cost: number;
  status: 'approved' | 'rejected' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface BookedDates {
  bookedDates: string[];
}

export interface UserBookings {
  bookings: Booking[];
  totalSpent: number;
  totalBookings: number;
}

export interface VendorBookings {
  bookings: Booking[];
}

export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  approvalRate: number; // ✅ ADDED
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private api = 'http://192.168.1.11:3000/bookings';

  private mockBookings: Booking[] = [];

  // Get all booked dates for a specific venue
  getBookedDates(venueId: string) {
    return this.http.get<BookedDates>(`${this.api}/venue/${venueId}/booked-dates`);
  }

  // Create a new booking
  createBooking(data: {
    userId: string;
    vendorId: string;
    venueId: string;
    date: string;
    cost: number;
  }) {
    return this.http.post<{ message: string; booking: Booking }>(`${this.api}`, data);
  }

  // Get all bookings (admin dashboard) - with fallback to mock data
  getAllBookings() {
    return this.http.get<{ bookings: Booking[] }>(`${this.api}`).pipe(
      catchError((error) => {
        console.warn('Failed to fetch bookings from API, using mock data:', error);
        return of({ bookings: this.mockBookings });
      })
    );
  }

  // Get booking history for a specific user
  getUserBookings(userId: string) {
    return this.http.get<UserBookings>(`${this.api}/user/${userId}`);
  }

  // Get bookings for a specific vendor
  getVendorBookings(vendorId: string) {
    return this.http.get<VendorBookings>(`${this.api}/vendor/${vendorId}`);
  }

  // Update booking status
  updateBookingStatus(bookingId: string, status: 'approved' | 'rejected' | 'pending') {
    return this.http.put<{ message: string; booking: Booking }>(
      `${this.api}/${bookingId}/status`,
      { status }
    );
  }

  // ✅ UPDATED — added approvalRate, guards division by zero
  calculateStats(bookings: Booking[]): BookingStats {
    const total = bookings.length;
    const approvedCount = bookings.filter(b => b.status === 'approved').length;
    const rejectedCount = bookings.filter(b => b.status === 'rejected').length;
    const pendingCount  = bookings.filter(b => b.status === 'pending').length;

    return {
      totalBookings: total,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.status !== 'rejected' ? b.cost : 0), 0),
      approvedCount,
      rejectedCount,
      pendingCount,
      approvalRate: total > 0 ? Math.round((approvedCount / total) * 100) : 0,
    };
  }

  // Get bookings grouped by month for revenue chart
  getMonthlyRevenue(bookings: Booking[]) {
    const monthlyData: { [key: string]: number } = {};
    bookings.forEach(b => {
      if (b.status !== 'rejected') {
        const date = new Date(b.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + b.cost;
      }
    });
    return monthlyData;
  }

  // Get revenue grouped by vendor
  getVendorRevenue(bookings: Booking[]) {
    const vendorData: { [key: string]: number } = {};
    bookings.forEach(b => {
      if (b.status !== 'rejected') {
        const vendorName = b.vendorId?.name || 'Unknown';
        vendorData[vendorName] = (vendorData[vendorName] || 0) + b.cost;
      }
    });
    return vendorData;
  }

  // Get bookings count grouped by venue
  getVenueBookingCounts(bookings: Booking[]) {
    const venueData: { [key: string]: number } = {};
    bookings.forEach(b => {
      const venueName = b.venueId?.name || 'Unknown';
      venueData[venueName] = (venueData[venueName] || 0) + 1;
    });
    return venueData;
  }
}