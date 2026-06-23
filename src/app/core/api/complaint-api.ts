// Purpose: Handles API calls for complaint management.
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { Complaint, ComplaintMessage } from '@core/models/complaint.model';

@Injectable({ providedIn: 'root' })
export class ComplaintApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/complaints`;

  // Get all complaints
  getComplaints(page: number = 1, limit: number = 10, search: string = '', status: string = 'all', sortBy: string = '', sortOrder: string = ''): Observable<any> {
    let url = `${this.baseUrl}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') url += `&status=${status}`;
    if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
    if (sortOrder) url += `&sortOrder=${encodeURIComponent(sortOrder)}`;
    return this.http.get<any>(url);
  }

  // Get single complaint details
  getComplaintById(id: string): Observable<Complaint> {
    return this.http.get<Complaint>(`${this.baseUrl}/${id}`);
  }

  // Update status
  updateStatus(id: string, status: string): Observable<{ message: string; complaint: Complaint }> {
    return this.http.put<{ message: string; complaint: Complaint }>(`${this.baseUrl}/${id}/status`, { status });
  }

  // Assign complaint to vendor (Admin only)
  assignVendor(id: string, vendorId: string | null): Observable<{ message: string; complaint: Complaint }> {
    return this.http.put<{ message: string; complaint: Complaint }>(`${this.baseUrl}/${id}/assign`, { vendorId });
  }

  // Get thread messages
  getMessages(id: string): Observable<ComplaintMessage[]> {
    return this.http.get<ComplaintMessage[]>(`${this.baseUrl}/${id}/messages`);
  }

  // Post message to thread
  postMessage(id: string, message: string): Observable<ComplaintMessage> {
    return this.http.post<ComplaintMessage>(`${this.baseUrl}/${id}/messages`, { message });
  }
}
