import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendor } from './vendor.model';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private http = inject(HttpClient);
  /* private api = 'http://localhost:3000/vendors';  */ 
  private api = 'http://192.168.1.13:3000/vendors';  

  // GET all vendors
  getVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.api);
  }

  // UPDATE vendor status
  updateVendor(id: string, data: Partial<Vendor>) {
    return this.http.patch(`${this.api}/${id}`, data);
  }

  // Add-new vendor (offline)
  addVendor(data: Partial<Vendor>) {
    return this.http.post(this.api, data);
  }

  // for edit and delete vendor 
  deleteVendor(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  getVendorById(id: string) {
    return this.http.get<Vendor>(`${this.api}/${id}`);
  }
}
