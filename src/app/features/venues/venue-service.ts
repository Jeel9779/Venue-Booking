import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class VenueService {

  private http = inject(HttpClient);


  private api = 'http://192.168.1.13:3000/venues';

  getVenues() {
    return this.http.get<any[]>(this.api);
  }



  updateVenue(id: string, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }



}
