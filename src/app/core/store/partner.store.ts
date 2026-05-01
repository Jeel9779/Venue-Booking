import { Injectable, signal, computed } from '@angular/core';
import { Venue } from '../models/venue.model';
import { Partner, PartnerKPI } from '../models/partner.model';

@Injectable({ providedIn: 'root' })
export class PartnerStore {
  // ── State ──
  private readonly _rawVenues = signal<Venue[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors (Computed) ──
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  readonly partners = computed(() => {
    const spaces = this._rawVenues();
    const partnerMap = new Map<string, Venue[]>();

    spaces.forEach(space => {
      const vendorKey = !space.vendorId
        ? 'unassigned'
        : typeof space.vendorId === 'string'
          ? space.vendorId
          : (space.vendorId as any)._id;

      if (!partnerMap.has(vendorKey)) {
        partnerMap.set(vendorKey, []);
      }
      partnerMap.get(vendorKey)!.push(space);
    });

    const partners: Partner[] = Array.from(partnerMap.entries()).map(
      ([id, spaces]) => {
        const vendor = typeof spaces[0].vendorId === 'object' && spaces[0].vendorId !== null
          ? spaces[0].vendorId
          : null;
        return {
          id,
          name: id === 'unassigned' ? 'Unassigned Venues' : ((vendor as any)?.fullName || 'Vendor'),
          email: (vendor as any)?.email || '',
          spaces,
        };
      }
    );
    return partners;
  });

  readonly kpi = computed<PartnerKPI>(() => {
    const spaces = this._rawVenues();
    return {
      vendors: this.partners().length,
      venues: spaces.length,
      active: spaces.filter(s => s.status === 'approved').length,
      pending: spaces.filter(s => s.status === 'pending').length,
    };
  });

  // ── Updaters ──
  setVenues(venues: Venue[]) {
    this._rawVenues.set(venues);
  }

  setLoading(loading: boolean) {
    this._isLoading.set(loading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }
}
