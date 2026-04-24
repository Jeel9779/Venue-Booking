import { Injectable, signal, computed, inject } from '@angular/core';
/* import { VenueService } from '../services/venue.service'; */
import { AdminVenueService } from '../services/admin-venue.service';
import type { Venue, VenueVM, Partner } from '../models/venue-types.modal'

@Injectable({
  providedIn: 'root',
})
export class VenueStoreService {
  /*  private venueService = inject(VenueService); */ //  uses YOUR existing serv

  private venueService = inject(AdminVenueService);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  private rawVenues = signal<Venue[]>([]);

  readonly vm = computed<VenueVM>(() => {
    console.log(this.rawVenues());
    const spaces = this.rawVenues();
    const partnerMap = new Map<string, Venue[]>();

    /*  spaces.forEach(space => {
       if (!partnerMap.has(space.vendorId)) partnerMap.set(space.vendorId, []);
       partnerMap.get(space.vendorId)!.push(space);
     }); */
    spaces.forEach(space => {
      const vendorKey =
        typeof space.vendorId === 'string'
          ? space.vendorId
          : space.vendorId._id;

      if (!partnerMap.has(vendorKey)) {
        partnerMap.set(vendorKey, []);
      }

      partnerMap.get(vendorKey)!.push(space);
    });


    const partners: Partner[] = Array.from(partnerMap.entries()).map(
      ([id, spaces]) => {
        const vendor =
          typeof spaces[0].vendorId === 'object'
            ? spaces[0].vendorId
            : null;

        return {
          id,
          name: vendor?.fullName || 'Vendor',
          email: vendor?.email || '',
          spaces,
        };
      }
    );

    return {
      partners,
      kpi: {
        vendors: partnerMap.size,
        venues: spaces.length,
        active: spaces.filter(s => s.status === 'approved').length,
        pending: spaces.filter(s => s.status === 'pending').length,
      },
    };
  });

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.venueService.getVenues().subscribe({
      /*   next: venues => {
         this.rawVenues.set(venues as Venue[]);
         this.loading.set(false);
       },  */
      next: (res: any) => {
        const venues = (res.data || res).map((v: any) => ({
          ...v,
          amenities: Array.isArray(v.amenities)
            ? v.amenities
            : [],
        }));

        this.rawVenues.set(venues);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.message || 'Failed to load venues');
        this.loading.set(false);
      },
    });
  }

  // Call this after any mutation (approve/reject/delete) to refresh
  refresh() {
    this.load();
  }
}
