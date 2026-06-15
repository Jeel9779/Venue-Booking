// Purpose: Component/Logic: Handles UI behavior and user interactions for partner-api.
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Venue } from '../models/venue.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({ providedIn: 'root' })
// Defines the structure and behavior of this class
export class PartnerApi {
  private readonly http = inject(HttpClient);
  private readonly api = `${API_BASE_URL}/admin/venues`;


  approveVenue(id: string) {
    return this.http.put<Venue>(`${this.api}/${id}/status`, { status: 'approved' });
  }

  rejectVenue(id: string, reason: string) {
    return this.http.put<Venue>(`${this.api}/${id}/status`, {
      status: 'rejected',
      adminDescription: reason,
    });
  }

  deleteVenue(id: string) {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  getVenues(page: number = 1, limit: number = 10, search: string = '', status: string = 'all'): Observable<any> {
    let url = `${this.api}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') url += `&status=${status}`;
    return this.http.get<any>(url).pipe(
      map(res => res)
    );
  }
}
