import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking, BookedDates, UserBookings, VendorBookings } from '../models/booking.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({ providedIn: 'root' })
export class BookingApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/bookings`;

  getBookedDates(venueId: string): Observable<BookedDates> {
    return this.http.get<BookedDates>(`${this.baseUrl}/venue/${venueId}/booked-dates`);
  }

  createBooking(data: { userId: string; vendorId: string; venueId: string; date: string; cost: number }): Observable<{ message: string; booking: Booking }> {
    return this.http.post<{ message: string; booking: Booking }>(this.baseUrl, data);
  }

  getAllBookings(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?page=${page}&limit=${limit}`).pipe(
      map(res => res)
    );
  }

  getUserBookings(userId: string): Observable<UserBookings> {
    return this.http.get<UserBookings>(`${this.baseUrl}/user/${userId}`);
  }

  getVendorBookings(vendorId: string): Observable<VendorBookings> {
    return this.http.get<VendorBookings>(`${this.baseUrl}/vendor/${vendorId}`);
  }

  updateBookingStatus(bookingId: string, status: 'approved' | 'rejected'): Observable<{ message: string; booking: Booking }> {
    return this.http.put<{ message: string; booking: Booking }>(`${this.baseUrl}/${bookingId}/status`, { status });
  }
}
