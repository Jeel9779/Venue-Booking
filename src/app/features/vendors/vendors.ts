import { Component, OnInit, signal } from '@angular/core';
import { VendorService, Vendor } from './vendor-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css',
})
export class Vendors implements OnInit {

  vendors = signal<Vendor[]>([]);
  isLoading = signal(false);
  error = signal('');

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
        this.error.set('Failed to load vendors');
        this.isLoading.set(false);
      }
    });
  }

  // ✅ APPROVE
  approve(v: Vendor) {
    this.vendorService.updateVendor(v.id, {
      status: 'approved',
      adminMessage: 'Approved successfully'
    }).subscribe(() => this.loadVendors());
  }

  // ❌ REJECT
  reject(v: Vendor) {
    this.vendorService.updateVendor(v.id, {
      status: 'rejected',
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

  // 📄 LICENSE PREVIEW
  previewDoc(url: string) {
    window.open(url, '_blank');
  }
}