// Purpose: Service: Handles business logic and API communication for partner.
import { inject, Injectable } from '@angular/core';
import { PartnerApi } from '../api/partner-api';
import { PartnerStore } from '../store/partner.store';
import { finalize } from 'rxjs';
import { Venue } from '../models/venue.model';

@Injectable({ providedIn: 'root' })
// Defines the structure and behavior of this class
export class PartnerService {
  private readonly api = inject(PartnerApi);
  private readonly store = inject(PartnerStore);

  /**
   * Fetches all venues and updates the store.
   * Ensures amenities is always an array.
   */
  loadAll(page: number = 1, limit: number = 10, search: string = '', status: string = 'all') {
    this.store.setLoading(true);
    this.store.setError(null);
    this.api.getVenues(page, limit, search, status).pipe(
      finalize(() => this.store.setLoading(false))
    ).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        const venues = data.map((v: any) => ({
          ...v,
          amenities: Array.isArray(v.amenities) ? v.amenities : [],
        }));
        this.store.setVenues(venues);

        if (!Array.isArray(res)) {
          this.store.setPagination({
            page: res.page || page,
            limit: res.limit || limit,
            totalRecords: res.totalRecords || venues.length,
            totalPages: res.totalPages || Math.max(1, Math.ceil((res.totalRecords || venues.length) / (res.limit || limit)))
          });
        } else {
          this.store.setPagination({
            page, limit, totalRecords: venues.length, totalPages: Math.max(1, Math.ceil(venues.length / limit))
          });
        }
      },
      error: (err) => this.store.setError(err?.message || 'Failed to load partners/venues')
    });
  }

  /**
   * Approves a venue and updates it in the store.
   */
  approveVenue(venueId: string, onSuccess?: () => void, onError?: (err: string) => void) {
    // Optimistic UI could be done here if we wanted to change status locally first
    this.api.approveVenue(venueId).subscribe({
      next: (venue: Venue) => {
        this.store.updateVenueInStore(venue);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        if (onError) onError(err?.message || 'Approve failed.');
      }
    });
  }

  /**
   * Rejects a venue with a reason and updates it in the store.
   */
  rejectVenue(venueId: string, reason: string, onSuccess?: () => void, onError?: (err: string) => void) {
    this.api.rejectVenue(venueId, reason).subscribe({
      next: (venue: Venue) => {
        this.store.updateVenueInStore(venue);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        if (onError) onError(err?.message || 'Reject failed.');
      }
    });
  }

  /**
   * Deletes a venue from the API.
   * Implements OPTIMISTIC UI: removes from store immediately, rolls back on error.
   */
  deleteVenue(venueId: string, onSuccess?: () => void, onError?: (err: string) => void) {
    const previousVenues = [...this.store.getSnapshot()]; 
    this.store.removeVenueFromStore(venueId);

    this.api.deleteVenue(venueId).subscribe({
      next: () => {
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        // Rollback to previous state if API call fails
        this.store.setVenues(previousVenues);
        if (onError) onError(err?.message || 'Delete failed.');
      }
    });
  }
}
