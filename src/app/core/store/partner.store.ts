import { Injectable, signal, computed } from '@angular/core';
import { Venue, VendorInfo } from '../models/venue.model';
import { Partner, PartnerKPI } from '../models/partner.model';

@Injectable({ providedIn: 'root' })
export class PartnerStore {
  // ── State (Private Signals) ──
  // Holds the raw list of venues fetched from the API
  private readonly _rawVenues = signal<Venue[]>([]);
  // Global loading state for venue operations
  private readonly _isLoading = signal<boolean>(false);
  // Global error message state
  private readonly _error = signal<string | null>(null);

  // ── Selectors (Computed) ──
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  /**
   * Transforms raw venues into a grouped list of Partners.
   * Logic:
   * 1. Groups venues by vendorId (handling 'unassigned' for venues without a vendor).
   * 2. Extracts vendor info from the first venue in each group to populate Partner fields.
   */
  readonly partners = computed(() => {
    const spaces = this._rawVenues();
    const partnerMap = new Map<string, Venue[]>();

    spaces.forEach(space => {
      const vendorKey = !space.vendorId
        ? 'unassigned'
        : typeof space.vendorId === 'string'
          ? space.vendorId
          : space.vendorId._id;

      if (!partnerMap.has(vendorKey)) {
        partnerMap.set(vendorKey, []);
      }
      partnerMap.get(vendorKey)!.push(space);
    });

    const partners: Partner[] = Array.from(partnerMap.entries()).map(
      ([id, spaces]) => {
        // Safe check for vendor object (assuming vendor info is populated in the first space)
        const vendor = typeof spaces[0].vendorId === 'object' && spaces[0].vendorId !== null
          ? (spaces[0].vendorId as VendorInfo)
          : null;
          
        return {
          id,
          name: id === 'unassigned' ? 'Unassigned Venues' : (vendor?.fullName || 'Vendor'),
          email: vendor?.email || '',
          phone: vendor?.phone,
          businessName: vendor?.businessName,
          businessType: vendor?.businessType,
          isSubscriptionActive: spaces.some(s => s.isSubscriptionActive),
          spaces,
        };
      }
    );
    return partners;
  });

  /**
   * Aggregated metrics for the dashboard.
   * Calculates vendor count, venue status counts, and quality metrics.
   */
  readonly kpi = computed<PartnerKPI>(() => {
    const spaces = this._rawVenues();
    const allReviews = spaces.flatMap(s => s.reviews || []);
    const ratedVenues = spaces.filter(s => s.averageRating > 0);
    const avgRating = ratedVenues.length > 0 
      ? ratedVenues.reduce((acc, v) => acc + v.averageRating, 0) / ratedVenues.length 
      : 0;

    // Direct calculation of unique vendors from raw venues
    const uniqueVendors = new Set(
      spaces.map(s => !s.vendorId ? 'unassigned'
        : typeof s.vendorId === 'string' ? s.vendorId
        : s.vendorId._id)
    ).size;

    return {
      vendors: uniqueVendors,
      venues: spaces.length,
      active: spaces.filter(s => s.status === 'approved').length,
      pending: spaces.filter(s => s.status === 'pending').length,
      totalReviews: allReviews.length,
      avgRating: Number(avgRating.toFixed(1)),
    };
  });

  /**
   * Returns a synchronous snapshot of the current venues list.
   * Used for optimistic UI rollbacks or one-off logic.
   */
  getSnapshot(): Venue[] {
    return this._rawVenues();
  }

  // ── Updaters ──
  setVenues(venues: Venue[]) {
    this._rawVenues.set(venues);
  }

  updateVenueInStore(updatedVenue: Venue) {
    this._rawVenues.update(venues => 
      venues.map(v => v._id === updatedVenue._id ? updatedVenue : v)
    );
  }

  removeVenueFromStore(venueId: string) {
    this._rawVenues.update(venues => 
      venues.filter(v => v._id !== venueId)
    );
  }

  setLoading(loading: boolean) {
    this._isLoading.set(loading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }
}
