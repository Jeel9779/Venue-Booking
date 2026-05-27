// Purpose: Service: Handles business logic and API communication for vendor-subscription.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VendorSubscription } from '@core/models/vendor-subscription.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class VendorSubscriptionServices {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/vendorSubscriptions';

  // GET all
  getAll(): Observable<VendorSubscription[]> {
    return this.http.get<VendorSubscription[]>(this.apiUrl);
  }

  // UPDATE (approve/reject)
  update(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
