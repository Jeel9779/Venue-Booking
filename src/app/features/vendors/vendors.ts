import { Component, OnInit, signal } from '@angular/core';
import { VendorService , Vendor} from './vendor-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendors',
  imports: [],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css',
})
export class Vendors implements OnInit {

   vendors = signal<Vendor[]>([]);
  isLoading = signal(false);

  constructor(private vendorService: VendorService) {}

  ngOnInit() {
    this.loadVendors();
  }

  loadVendors() {
    this.isLoading.set(true);

    this.vendorService.getVendors().subscribe({
      next: (data) => {
        this.vendors.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // ✅ APPROVE
  approve(v: Vendor) {
    this.vendorService.updateVendor(v.id, {
      status: 'success',
      adminMessage: 'Approved successfully'
    }).subscribe(() => this.loadVendors());
  }

  // ❌ REJECT
  reject(v: Vendor) {
    this.vendorService.updateVendor(v.id, {
      status: 'cancel',
      adminMessage: 'Rejected by admin'
    }).subscribe(() => this.loadVendors());
  }

  // 🔄 REOPEN
  reopen(v: Vendor) {
    this.vendorService.updateVendor(v.id, {
      status: 'pending',
      adminMessage: ''
    }).subscribe(() => this.loadVendors());
  }

}

/* vendors = signal<Vendor[]>([]);
  constructor(private vendorService: VendorService) {}

  ngOnInit() {
    this.loadVendors();
  }

  loadVendors() {
    this.vendorService.getVendors().subscribe(data => {
      this.vendors.set(data);
    });
  }


  approve(vendor: Vendor) {
    this.vendorService.updateVendor(vendor.id, {
      status: 'success',
      adminMessage: 'Approved successfully'
    }).subscribe(() => {
      this.loadVendors(); 
    });
  }

  reject(vendor: Vendor) {
    this.vendorService.updateVendor(vendor.id, {
      status: 'cancel',
      adminMessage: 'Rejected by admin'
    }).subscribe(() => {
      this.loadVendors();
    });
  }


  reopen(vendor: { id: string; }) {
  this.vendorService.updateVendor(vendor.id, {
    status: 'pending',
    adminMessage: ''
  }).subscribe(() => this.loadVendors());
} */