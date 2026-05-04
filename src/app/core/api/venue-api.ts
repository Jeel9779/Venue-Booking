import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venue } from '../models/venue.model';

@Injectable({
  providedIn: 'root',
})
export class VenueApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://192.168.1.7:3000/venues';

  /**
   * Fetches all venues from the backend. 
   * Uses ?admin=true to ensure the admin-level data is returned.
   */
  getAll(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.baseUrl}?admin=true`);
  }

  /**
   * Fetches a single venue by its unique ID.
   */
  getById(id: string): Observable<Venue> {
    return this.http.get<Venue>(`${this.baseUrl}/${id}`);
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
    return this.http.put<Venue>(`${this.baseUrl}/${id}`, venue);
  }

  /**
   * Permanently deletes a venue listing.
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
