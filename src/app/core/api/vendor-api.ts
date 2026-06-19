// Purpose: Component/Logic: Handles UI behavior and user interactions for vendor-api.
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vendor } from '../models/vendor.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class VendorApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/vendors`;

  getAll(
    page: number = 1, 
    limit: number = 10,
    search: string = '', 
    status: string = '',
    sortBy: string = '',
    sortOrder: string = ''
  ): Observable<any> {
    let url = `${this.baseUrl}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') url += `&status=${status}`;
    if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
    if (sortOrder) url += `&sortOrder=${encodeURIComponent(sortOrder)}`;

    return this.http.get<any>(url).pipe(
      map(res => {
        return res;
      })
    );
  }

  getStats(): Observable<{ total: number; approved: number; pending: number; rejected: number; suspended: number }> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
  }

  getById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.baseUrl}/${id}`);
  }

  create(formData: FormData): Observable<{ message: string; vendor: Vendor }> {
    // Backend uses /vendors/register for POST
    return this.http.post<{ message: string; vendor: Vendor }>(`${this.baseUrl}/register`, formData);
  }

  // Backend uses PUT /vendors/approve/:id
  approve(id: string, data: any): Observable<{ message: string; vendor: Vendor }> {
    return this.http.put<{ message: string; vendor: Vendor }>(`${this.baseUrl}/approve/${id}`, data);
  }

  // Backend uses PUT /vendors/reject/:id
  reject(id: string, data: { message: string }): Observable<{ message: string; vendor: Vendor }> {
    return this.http.put<{ message: string; vendor: Vendor }>(`${this.baseUrl}/reject/${id}`, data);
  }

  // Backend uses PUT /vendors/suspend/:id
  suspend(id: string): Observable<{ message: string; vendor: Vendor }> {
    return this.http.put<{ message: string; vendor: Vendor }>(`${this.baseUrl}/suspend/${id}`, {});
  }

  // Backend uses PUT /vendors/unsuspend/:id
  unsuspend(id: string): Observable<{ message: string; vendor: Vendor }> {
    return this.http.put<{ message: string; vendor: Vendor }>(`${this.baseUrl}/unsuspend/${id}`, {});
  }

  // Backend uses DELETE /vendors/:id (Soft delete)
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
