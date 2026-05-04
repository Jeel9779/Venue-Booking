import { inject, Injectable } from '@angular/core';
import { finalize, tap, catchError, of } from 'rxjs';
import { VenueApi } from '../api/venue-api';
import { VenueStore } from '../store/venue.store';
import { Venue } from '../models/venue.model';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  // DI
  private readonly api = inject(VenueApi);
  private readonly store = inject(VenueStore);

  /**
   * Loads all venues from the API and synchronizes the local Store.
   * Handles loading states, data transformation (amenities parsing), and error reporting.
   */
  loadAll(): void {
    this.store.setLoading(true);
    this.api.getAll().pipe(
      tap((venues) => {
        // Data Transformation: Ensure amenities are always a clean string array
        const parsedVenues = venues.map(v => ({
          ...v,
          amenities: this.parseAmenities(v.amenities)
        }));
        this.store.setVenues(parsedVenues);
      }),
      catchError((err) => {
        // Error Handling: Identify if server is offline or returned a specific error
        const message = err.status === 0 ? 'Server unreachable' : (err.message || 'Failed to load venues');
        this.store.setError(message);
        return of([]);
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }

  /**
   * Updates the status of a venue (Approve/Reject).
   * @param id The venue ID
   * @param status The new status
   * @param adminDescription Feedback for the vendor (required for rejections)
   */
  updateStatus(id: string, status: 'approved' | 'rejected', adminDescription?: string): void {
    this.store.setLoading(true);
    this.api.update(id, { status, adminDescription }).pipe(
      tap((updatedVenue) => {
        const parsedVenue = {
          ...updatedVenue,
          amenities: this.parseAmenities(updatedVenue.amenities)
        };
        this.store.updateVenue(parsedVenue); // Update the specific item in the store
      }),
      catchError((err) => {
        this.store.setError(err.message || 'Failed to update venue status');
        return of(null);
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }

  /**
   * Utility to handle inconsistent 'amenities' data from the backend.
   * The backend might send:
   * 1. A JSON string inside an array: ["[\"Wifi\", \"Parking\"]"]
   * 2. A raw JSON string: "[\"Wifi\", \"Parking\"]"
   * 3. A comma-separated string: "Wifi, Parking"
   * 4. A clean array: ["Wifi", "Parking"]
   */
  private parseAmenities(raw: unknown): string[] {
    if (!raw) return [];

    let data = raw;

    // Step 1: Extract string from single-element array if it looks like JSON
    if (Array.isArray(raw) && raw.length === 1 && typeof raw[0] === 'string' && raw[0].startsWith('[')) {
      data = raw[0];
    }

    // Step 2: Try to parse string data
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback: If not JSON, split by comma
        return data.split(',').map(s => s.trim()).filter(s => !!s);
      }
    }

    // Step 3: Return if already an array
    if (Array.isArray(data)) {
      return data.filter((x): x is string => typeof x === 'string');
    }

    return [];
  }
}
