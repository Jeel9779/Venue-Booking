// Purpose: Component/Logic: Handles UI behavior and user interactions for payment-api.
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Payment, PaymentStats, PaymentFilters } from '../models/payment.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class PaymentApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/payments`;   // Matching the pattern in venue-api

  /**
   * Fetches all payments with optional filtering
   */
  getAll(filters?: Partial<PaymentFilters>, page: number = 1, limit: number = 10, search: string = '', sortBy: string = '', sortOrder: string = ''): Observable<{ data: Payment[]; page?: number; limit?: number; totalRecords?: number; totalPages?: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortOrder) params = params.set('sortOrder', sortOrder);


    if (filters) {
      if (filters.type && filters.type !== 'all') params = params.set('type', filters.type);
      if (filters.paymentStatus && filters.paymentStatus !== 'all') params = params.set('paymentStatus', filters.paymentStatus);
      if (filters.vendorId) params = params.set('vendorId', filters.vendorId);
    }
    return this.http.get<{ data: Payment[]; page?: number; limit?: number; totalRecords?: number; totalPages?: number }>(`${API_BASE_URL}/payments/admin-vendor`, { params });
  }



  /**
   * Fetches a single payment by ID
   */
  getById(id: string): Observable<Payment> {
    return this.http.get<{ data: Payment }>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  /**
   * Refund or update payment status (if needed)
   */
  updateStatus(id: string, status: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.baseUrl}/${id}/status`, { status });
  }
}
