import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Venue } from '../models/venue-types.modal';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  /*   private api = 'http://192.168.29.122:3000/venues';  */

  private http = inject(HttpClient);
  private api = 'http://192.168.1.11:3000/venues';

  // calls backend → returns Observable
  getVenues() {
    return this.http.get<Venue[]>(this.api);
  }

  // update venue
  updateVenue(id: string, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }
}
