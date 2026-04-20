import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendor } from './vendor.model';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private http = inject(HttpClient);

  private api = 'http://192.168.1.11:3000/vendors';


  // GET all vendors
  getVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.api);
  }

  // UPDATE vendor status
  updateVendor(id: string, data: Partial<Vendor>) {
    return this.http.patch(`${this.api}/${id}`, data);
  }

  // Add-new vendor (offline)
  /*  addVendor(data: Partial<Vendor>) {
     return this.http.post(this.api, data);
   } */

  addVendor(data: FormData) {
    return this.http.post(`${this.api}/register`, data);
  }

  // for edit and delete vendor
  deleteVendor(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  getVendorById(id: string) {
    return this.http.get<Vendor>(`${this.api}/${id}`);
  }

  approveVendor(id: string, username: string, password: string, adminId: string) {
    return this.http.put(
      `${this.api}/approve/${id}`,
      { username, password },
      {
        headers: { adminId },
      },
    );
  }

  rejectVendor(id: string, adminId: string, reason?: string) {
    return this.http.put(
      `${this.api}/reject/${id}`,
      { message: reason },
      {
        headers: { adminId },
      },
    );
  }
}
