import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Venue {
  id: string;
  vendorId: string;
  venueName: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  capacity: number;
  pricePerDay: number;
  amenities: string[];
  images: string[];
  description: string;
  status: string;
  adminMessage: string;
}

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/venues';

  getVenues() {
    return this.http.get<Venue[]>(this.api);
  }

 /*  updateVenue(id: string, data: Partial<Venue>) {
    return this.http.patch(`${this.api}/${id}`, data);
  } */

    updateVenue(id: string, data: any) {
  return this.http.patch(`http://localhost:3000/venues/${id}`, data);
}
}
