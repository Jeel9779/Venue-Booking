import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vendor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  governmentId: string;
  status: string;
  adminMessage: string;
}

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/vendors';

  // GET all vendors
  getVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.api);
  }

  // UPDATE vendor status
  updateVendor(id: string, data: Partial<Vendor>) {
    return this.http.patch(`${this.api}/${id}`, data);
  }
}
