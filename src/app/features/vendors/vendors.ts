import { Component, OnInit, signal, computed } from '@angular/core';
import { VendorService } from './vendor-service';
import { CommonModule } from '@angular/common';
import { Vendor } from './vendor.model';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css',
})
export class Vendors implements OnInit {

  // ================= TOAST =================
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  // ================= STATE =================
  vendors = signal<Vendor[]>([]);
  isLoading = signal(false);

  filter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  search = signal('');

  selectedVendor = signal<Vendor | null>(null);

  showDetailsModal = signal(false);
  showRejectModal = signal(false);

  rejectReason = signal('');

  previewImage = signal<string | null>(null);

  constructor(private vendorService: VendorService) { }

  ngOnInit() {
    this.loadVendors();
  }

  // ================= LOAD =================
  loadVendors() {
    this.isLoading.set(true);

    this.vendorService.getVendors().subscribe({
      next: (data) => {
        this.vendors.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.showToast('Failed to load vendors', 'error');
        this.isLoading.set(false);
      },
    });
  }

  // ================= FILTER =================
  filteredVendors = computed(() => {
    let list = this.vendors();

    if (this.filter() !== 'all') {
      list = list.filter(
        v => v.status?.toLowerCase()?.trim() === this.filter()
      );
    }

    if (this.search()) {
      const s = this.search().toLowerCase();
      list = list.filter(v =>
        (v.fullName || '').toLowerCase().includes(s) ||
        (v.email || '').toLowerCase().includes(s) ||
        (v.businessName || '').toLowerCase().includes(s)
      );
    }

    return list;
  });

  // ================= DETAILS =================
  openDetails(v: Vendor) {
    this.selectedVendor.set(v);
    this.showDetailsModal.set(true);
  }

  closeDetails() {
    this.showDetailsModal.set(false);
    this.selectedVendor.set(null);
  }

  // ================= IMAGE =================
  openModal(img: string) {
    this.previewImage.set(img);
  }

  closeModal() {
    this.previewImage.set(null);
  }

  // ================= APPROVE =================
  approve(v: Vendor) {
    const username = prompt('Enter Username');
    const password = prompt('Enter Password');

    if (!username || !password) return;

    const adminId = localStorage.getItem('adminId');

    if (!adminId) {
      this.showToast('Admin not logged in', 'error');
      return;
    }

    // ✅ FIX: ensure _id exists
    if (!v._id) {
      this.showToast('Invalid vendor ID', 'error');
      return;
    }

    this.vendorService
      .approveVendor(v._id, username, password, adminId)
      .subscribe({
        next: () => {
          this.showToast('Vendor Approved ✅');
          this.loadVendors();
        },
        error: () => this.showToast('Approval Failed ❌', 'error')
      });
  }

  // ================= REJECT =================
  openRejectModal(v: Vendor) {
    this.selectedVendor.set(v);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  confirmReject() {
    const vendor = this.selectedVendor();

    if (!vendor || !vendor._id) {
      this.showToast('Invalid vendor', 'error');
      return;
    }

    const adminId = localStorage.getItem('adminId');

    if (!adminId) {
      this.showToast('Admin not logged in', 'error');
      return;
    }

    this.vendorService
      .rejectVendor(vendor._id, adminId, this.rejectReason())
      .subscribe({
        next: () => {
          this.showRejectModal.set(false);
          this.showToast('Vendor Rejected ❌', 'error');
          this.loadVendors();
        },
        error: () => this.showToast('Reject failed', 'error')
      });
  }
}