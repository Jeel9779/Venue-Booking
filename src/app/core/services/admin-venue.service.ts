import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Venue } from '../models/venue-types.model';

@Injectable({
  providedIn: 'root',
})
export class AdminVenueService {
  private http = inject(HttpClient);
    private api = 'http://192.168.1.11:3000/admin/venues'; 
 /*  private api = 'http://localhost:3000/admin/venues'; */


  approveVenue(id: string) {
    return this.http.patch<Venue>(`${this.api}/${id}/approve`, {});
  }

  rejectVenue(id: string, reason: string) {
    return this.http.patch<Venue>(`${this.api}/${id}/reject`, {
      adminDescription: reason,
    });
  }

  deleteVenue(id: string) {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  getVenues() {
    return this.http.get<any>(this.api);
  }
}
