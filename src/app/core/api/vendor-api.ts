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

  getAll(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?page=${page}&limit=${limit}`).pipe(
      map(res => {
        return res;
      })
    );
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

  // NOTE: Backend currently has NO delete route. 
  // We will keep this commented or as a dummy to avoid build errors if called.
  delete(id: string): Observable<void> {
    console.warn('Backend does not support DELETE /vendors/:id yet.');
    return new Observable(obs => obs.next());
  }
}
