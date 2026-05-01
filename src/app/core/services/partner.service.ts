import { inject, Injectable } from '@angular/core';
import { PartnerApi } from '../api/partner-api';
import { PartnerStore } from '../store/partner.store';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PartnerService {
  private readonly api = inject(PartnerApi);
  private readonly store = inject(PartnerStore);

  loadAll() {
    this.store.setLoading(true);
    this.store.setError(null);
    this.api.getVenues().pipe(
      finalize(() => this.store.setLoading(false))
    ).subscribe({
      next: (res: any) => {
        const venues = (res.data || res).map((v: any) => ({
          ...v,
          amenities: Array.isArray(v.amenities) ? v.amenities : [],
        }));
        this.store.setVenues(venues);
      },
      error: (err) => this.store.setError(err?.message || 'Failed to load partners/venues')
    });
  }

  approveVenue(venueId: string, onSuccess?: () => void, onError?: (err: string) => void) {
    this.api.approveVenue(venueId).subscribe({
      next: () => {
        this.loadAll();
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        if (onError) onError(err?.message || 'Approve failed.');
      }
    });
  }

  rejectVenue(venueId: string, reason: string, onSuccess?: () => void, onError?: (err: string) => void) {
    this.api.rejectVenue(venueId, reason).subscribe({
      next: () => {
        this.loadAll();
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        if (onError) onError(err?.message || 'Reject failed.');
      }
    });
  }

  deleteVenue(venueId: string, onSuccess?: () => void, onError?: (err: string) => void) {
    this.api.deleteVenue(venueId).subscribe({
      next: () => {
        this.loadAll();
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        if (onError) onError(err?.message || 'Delete failed.');
      }
    });
  }
}
