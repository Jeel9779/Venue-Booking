import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Payment, PaymentStats, PaymentFilters } from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://192.168.1.12:3000/payments';   // Matching the pattern in venue-api
  /*  private readonly baseUrl = 'http://localhost:3000/payments'; */

  /**
   * Fetches all payments with optional filtering
   */
  getAll(filters?: Partial<PaymentFilters>): Observable<Payment[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.type) params = params.set('type', filters.type);
      if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
      if (filters.vendorId) params = params.set('vendorId', filters.vendorId);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }
    return this.http.get<{ data: Payment[] }>(this.baseUrl, { params }).pipe(
      map(res => res.data)
    );
  }

  /**
   * Fetches payment statistics for dashboard KPIs
   */
  getStats(): Observable<PaymentStats> {
    return this.http.get<{ data: PaymentStats }>(`${this.baseUrl}/stats`).pipe(
      map(res => res.data)
    );
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
