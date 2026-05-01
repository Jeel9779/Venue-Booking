import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookedDates, UserBookings, VendorBookings } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://192.168.1.6:3000/bookings';

  getBookedDates(venueId: string): Observable<BookedDates> {
    return this.http.get<BookedDates>(`${this.baseUrl}/venue/${venueId}/booked-dates`);
  }

  createBooking(data: { userId: string; vendorId: string; venueId: string; date: string; cost: number }): Observable<{ message: string; booking: Booking }> {
    return this.http.post<{ message: string; booking: Booking }>(this.baseUrl, data);
  }

  getAllBookings(): Observable<{ bookings: Booking[] }> {
    return this.http.get<{ bookings: Booking[] }>(this.baseUrl);
  }

  getUserBookings(userId: string): Observable<UserBookings> {
    return this.http.get<UserBookings>(`${this.baseUrl}/user/${userId}`);
  }

  getVendorBookings(vendorId: string): Observable<VendorBookings> {
    return this.http.get<VendorBookings>(`${this.baseUrl}/vendor/${vendorId}`);
  }

  updateBookingStatus(bookingId: string, status: 'approved' | 'rejected' | 'pending'): Observable<{ message: string; booking: Booking }> {
    return this.http.put<{ message: string; booking: Booking }>(`${this.baseUrl}/${bookingId}/status`, { status });
  }
}
