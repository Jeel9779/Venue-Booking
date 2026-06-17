// Purpose: Component/Logic: Handles UI behavior and user interactions for venue-api.
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Venue } from '../models/venue.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class VenueApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/venues`;


  getAll(page: number = 1, limit: number = 10): Observable<any> {
    // Admin backend uses /admin/venues
    return this.http.get<any>(`${API_BASE_URL}/admin/venues?page=${page}&limit=${limit}`).pipe(
      map(res => res)
    );
  }

  /**
   * Fetches a single venue by its unique ID.
   */
  getById(id: string): Observable<Venue> {
    return this.http.get<Venue>(`${API_BASE_URL}/admin/venues/${id}`);
  }

  /**
   * Submits a new venue listing.
   */
  create(venue: Partial<Venue>): Observable<Venue> {
    return this.http.post<Venue>(this.baseUrl, venue);
  }

  /**
   * Updates an existing venue (e.g., status, description, or details).
   */
  update(id: string, venue: Partial<Venue>): Observable<Venue> {
    // According to admin docs, status update is PUT /admin/venues/:id/status
    if (venue.status) {
      return this.http.put<Venue>(`${API_BASE_URL}/admin/venues/${id}/status`, { status: venue.status });
    }
    return this.http.put<Venue>(`${this.baseUrl}/${id}`, venue);
  }

  /**
   * Manually trigger a synchronization of venue visibility
   */
  syncVisibility(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/sync-all-visibility`, {});
  }

  /**
   * Permanently deletes a venue listing.
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Deactivates a venue (admin soft-delete).
   */
  deactivate(id: string, reason: string, suspensionStart?: string, suspensionEnd?: string): Observable<Venue> {
    const body: any = { reason };
    if (suspensionStart && suspensionEnd) {
      body.suspensionStart = suspensionStart;
      body.suspensionEnd = suspensionEnd;
    }
    return this.http.patch<Venue>(`${API_BASE_URL}/admin/venues/${id}/deactivate`, body);
  }

  /**
   * Reactivates a venue.
   */
  reactivate(id: string): Observable<Venue> {
    return this.http.patch<Venue>(`${API_BASE_URL}/admin/venues/${id}/reactivate`, {});
  }
}
