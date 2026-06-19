// Purpose: Component/Logic: Handles UI behavior and user interactions for booking-api.
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking, BookedDates, UserBookings, VendorBookings } from '../models/booking.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({ providedIn: 'root' })
// Defines the structure and behavior of this class
export class BookingApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/bookings`;

  getBookedDates(venueId: string): Observable<BookedDates> {
    return this.http.get<BookedDates>(`${this.baseUrl}/venue/${venueId}/booked-dates`);
  }

  createBooking(data: { userId: string; vendorId: string; venueId: string; date: string; cost: number }): Observable<{ message: string; booking: Booking }> {
    return this.http.post<{ message: string; booking: Booking }>(this.baseUrl, data);
  }

  getAllBookings(
    page: number = 1, 
    limit: number = 10, 
    search: string = '', 
    status: string = '',
    sortBy: string = '',
    sortOrder: string = '',
    startDate: string = '',
    endDate: string = ''
  ): Observable<any> {
    let url = `${this.baseUrl}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') url += `&status=${status === 'paid' ? 'success' : status}`;
    if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
    if (sortOrder) url += `&sortOrder=${encodeURIComponent(sortOrder)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    
    return this.http.get<any>(url).pipe(
      map(res => res)
    );
  }

  getStats(): Observable<{ totalRevenue: number; collected: number; outstanding: number; todayCount: number }> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
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

  processRefund(bookingId: string, payload: { actorId: string, actorType: 'admin' }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${bookingId}/process-refund`, payload);
  }
}
