
import { Component, OnInit, signal } from '@angular/core';
import { VendorService } from './vendor-service';
import { CommonModule } from '@angular/common';
import { computed } from '@angular/core';
import { Vendor } from './vendor.model';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MoreVertical, Pencil, Trash2, LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css',
})
export class Vendors implements OnInit {

  vendors = signal<Vendor[]>([]);
  isLoading = signal(false);
  error = signal('');

  // ✅ FILTER + SEARCH
  filter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  search = signal('');

  // ✅ SELECTED
  selectedVendor = signal<Vendor | null>(null);

  // ✅ DETAILS MODAL
  showDetailsModal = signal(false);

  // ✅ REJECT MODAL
  showRejectModal = signal(false);
  rejectReason = signal('');

  // ✅ IMAGE MODAL
  previewImage = signal<string | null>(null);

  constructor(
    private vendorService: VendorService,
    private router: Router
  ) { }

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
      },
    });
  }

  // ✅ FILTER
  filteredVendors = computed(() => {
    let list = this.vendors();

    if (this.filter() !== 'all') {
      list = list.filter(
        v => v.status?.toLowerCase().trim() === this.filter()
      );
    }

    if (this.search()) {
      const s = this.search().toLowerCase();
      list = list.filter(v =>
        v.fullName.toLowerCase().includes(s) ||
        v.email.toLowerCase().includes(s) ||
        v.businessName.toLowerCase().includes(s)
      );
    }

    return list;
  });

  // ✅ OPEN DETAILS
  openDetails(v: Vendor) {
    this.selectedVendor.set(v);
    this.showDetailsModal.set(true);
  }

  // ✅ CLOSE DETAILS
  closeDetails() {
    this.showDetailsModal.set(false);
  }

  // ✅ IMAGE MODAL
  openModal(img: string) {
    this.previewImage.set(img);
  }

  closeModal() {
    this.previewImage.set(null);
  }

  // ✅ APPROVE
  approve(v: Vendor) {
    const username = prompt('Enter Username');
    const password = prompt('Enter Password');

    if (!username || !password) return;

    const adminId = localStorage.getItem('adminId');

    if (!adminId) {
      alert('Admin not logged in');
      return;
    }

    this.vendorService
      .approveVendor(v._id, username, password, adminId)
      .subscribe({
        next: () => this.loadVendors(),
        error: (err) => console.error(err)
      });
  }

  // ✅ REJECT
  openRejectModal(v: Vendor) {
    this.selectedVendor.set(v);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  confirmReject() {
    const vendor = this.selectedVendor();
    if (!vendor) return;

    const adminId = localStorage.getItem('adminId');

    if (!adminId) {
      alert('Admin not logged in');
      return;
    }

    this.vendorService
      .rejectVendor(vendor._id, adminId, this.rejectReason())
      .subscribe({
        next: () => {
          this.showRejectModal.set(false);
          this.loadVendors();
        },
        error: () => alert('Reject failed')
      });
  }

  // ✅ IMAGE URL FIX (🔥 MUST HAVE)
  /*  getImageUrl(path: string) {
     return 'http://localhost:3000/' + path.replace(/\\/g, '/');
   } */


}