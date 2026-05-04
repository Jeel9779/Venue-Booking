import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vendor } from '../models/vendor.model';

@Injectable({
  providedIn: 'root',
})
export class VendorApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://192.168.1.7:3000/vendors';

  getAll(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.baseUrl);
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
