import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Venue } from '../models/venue-types.modal';

@Injectable({
  providedIn: 'root',
})
export class VenueService {

  private http = inject(HttpClient);
  private api = 'http://192.168.1.11:3000/venues';
  /*   private api = 'http://localhost:5000/venues';  */



  // calls backend → returns Observable
  getVenues() {
    return this.http.get<any[]>(this.api);
  }


  /*  getVenues() {
     return this.http.get<Venue[]>(this.api); // typed properly now
   } */


  // update venue
  updateVenue(id: string, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }



}
