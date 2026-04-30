import { inject, Injectable } from '@angular/core';
import { finalize, tap, catchError, of } from 'rxjs';
import { VenueApi } from '../api/venue-api';
import { VenueStore } from '../store/venue.store';
import { Venue } from '../models/venue.model';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private readonly api = inject(VenueApi);
  private readonly store = inject(VenueStore);

  loadAll(): void {
    this.store.setLoading(true);
    this.api.getAll().pipe(
      tap((venues) => {
        const parsedVenues = venues.map(v => ({
          ...v,
          amenities: this.parseAmenities(v.amenities)
        }));
        this.store.setVenues(parsedVenues);
      }),
      catchError((err) => {
        const message = err.status === 0 ? 'Server unreachable' : (err.message || 'Failed to load venues');
        this.store.setError(message);
        return of([]);
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }

  updateStatus(id: string, status: 'approved' | 'rejected', adminDescription?: string): void {
    this.store.setLoading(true);
    this.api.update(id, { status, adminDescription }).pipe(
      tap((updatedVenue) => {
        const parsedVenue = {
          ...updatedVenue,
          amenities: this.parseAmenities(updatedVenue.amenities)
        };
        this.store.updateVenue(parsedVenue);
      }),
      catchError((err) => {
        this.store.setError(err.message || 'Failed to update venue status');
        return of(null);
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }

  private parseAmenities(raw: unknown): string[] {
    if (!raw) return [];
    
    let data = raw;

    // Step 1: If it's an array with a single JSON string inside, extract the string
    if (Array.isArray(raw) && raw.length === 1 && typeof raw[0] === 'string' && raw[0].startsWith('[')) {
      data = raw[0];
    }

    // Step 2: Try to parse if it's a string
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback for comma-separated
        return data.split(',').map(s => s.trim()).filter(s => !!s);
      }
    }

    // Step 3: If it's already a clean array, just filter and return
    if (Array.isArray(data)) {
      return data.filter((x): x is string => typeof x === 'string');
    }

    return [];
  }
}
