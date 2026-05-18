import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Venue } from '../models/venue.model';

@Injectable({ providedIn: 'root' })
export class PartnerApi {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://192.168.1.9:3000/admin/venues';
  /* private readonly api = 'http://localhost:3000/admin/venues'; */


  approveVenue(id: string) {
    return this.http.put<Venue>(`${this.api}/${id}/status`, { status: 'approved' });
  }

  rejectVenue(id: string, reason: string) {
    return this.http.put<Venue>(`${this.api}/${id}/status`, {
      status: 'rejected',
      adminDescription: reason,
    });
  }

  deleteVenue(id: string) {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  getVenues(): Observable<Venue[]> {
    return this.http.get<any>(this.api).pipe(
      map(res => Array.isArray(res) ? res : (res.data || []))
    );
  }
}
