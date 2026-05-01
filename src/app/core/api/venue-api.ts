import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Venue } from '../models/venue.model';

@Injectable({
  providedIn: 'root',
})
export class VenueApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://192.168.1.6:3000/venues';

  getAll(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.baseUrl}?admin=true`);
  }

  getById(id: string): Observable<Venue> {
    return this.http.get<Venue>(`${this.baseUrl}/${id}`);
  }

  create(venue: Partial<Venue>): Observable<Venue> {
    return this.http.post<Venue>(this.baseUrl, venue);
  }

  update(id: string, venue: Partial<Venue>): Observable<Venue> {
    return this.http.put<Venue>(`${this.baseUrl}/${id}`, venue);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
