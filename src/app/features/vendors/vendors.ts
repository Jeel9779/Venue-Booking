import { Component, OnInit, signal, computed } from '@angular/core';
import { VendorService } from '@core/services/vendor.service';  // service
import { Vendor } from '@core/models/vendor.model';   // Interface
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css',
})
export class Vendors implements OnInit {

  constructor(
    private router: Router,
    private vendorService: VendorService
  ) { }

  // go to Add Vendor page
  goToAddVendor() {
    this.router.navigate(['/add-vendor']);
  }

  // ================= TOAST =================
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  // ================= STATE =================
  vendors = signal<Vendor[]>([]); // Stores vendor list
  isLoading = signal(false);

  filter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  search = signal('');

  selectedVendor = signal<Vendor | null>(null);
  //  NEW MODALS
  showDetailsModal = signal(false);
  showApproveModal = signal(false);
  showRejectModal = signal(false);

  // FORM DATA
  credentials = signal({ username: '', password: '' });
  rejectReason = signal('');


  //Image preview
  previewImage = signal<string | null>(null);


  // Fetch data automatically
  ngOnInit() {
    this.loadVendors();
  }


  //api call to get all vendors
  loadVendors() {
    this.isLoading.set(true);

    // Observable (async data)
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


  // ================= COUNTS =================
  counts = computed(() => {
    const list = this.vendors();

    return {
      all: list.length,
      pending: list.filter(v => v.status?.toLowerCase().trim() === 'pending').length,
      approved: list.filter(v => v.status?.toLowerCase().trim() === 'approved').length,
      rejected: list.filter(v => v.status?.toLowerCase().trim() === 'rejected').length,
    };
  });


  // ================= DETAILS =================
  //open modal
  openDetails(v: Vendor) {
    this.selectedVendor.set(v);
    this.showDetailsModal.set(true);
  }

  // close modal
  closeDetails() {
    this.showDetailsModal.set(false);
    this.selectedVendor.set(null);
  }

  // ================= IMAGE =================
  // show img
  openModal(img?: string) {
    if (!img) return;
    this.previewImage.set(img);
  }

  // close img
  closeModal() {
    this.previewImage.set(null);
  }

  // ================= APPROVE =================
  approve(v: Vendor) {
    this.selectedVendor.set(v);
    this.credentials.set({ username: '', password: '' });
    this.showApproveModal.set(true);
  }

  confirmApprove() {
    const vendor = this.selectedVendor();
    const { username, password } = this.credentials();

    if (!vendor || !vendor._id || !username || !password) {
      this.showToast('Fill all fields', 'error');
      return;
    }

    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      this.showToast('Admin not logged in', 'error');
      return;
    }

    this.vendorService
      .approveVendor(vendor._id, username, password, adminId)
      .subscribe({
        next: () => {
          this.showApproveModal.set(false);

          this.showDetailsModal.set(false); // ✅ ADD THIS
          this.selectedVendor.set(null);    // ✅ ADD THIS
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

    if (!vendor || !vendor._id || !this.rejectReason()) {
      this.showToast('Enter reject reason', 'error');
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
          this.showDetailsModal.set(false); // ✅ ADD THIS
          this.selectedVendor.set(null);    // ✅ ADD THIS

          // Force UI refresh (important)
          this.rejectReason.set('');
          this.showToast('Vendor Rejected ❌', 'error');
          this.loadVendors();
        },
        error: () => this.showToast('Reject failed', 'error')
      });
  }
}

/* Improvements (important)
 Move business logic to service
 Use token instead of adminId
 Add unsubscribe handling
 Remove unused methods
 improve:

Unsubscribe handling
Central modal management
Auth (JWT instead of adminId)
Error handling (global)
Form validation
 */