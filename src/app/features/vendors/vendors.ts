import { HostListener } from '@angular/core';
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

  MoreVertical = MoreVertical;
  Pencil = Pencil;
  Trash2 = Trash2;

  previewDoc(arg0: string) {
    throw new Error('Method not implemented.');
  }
  vendors = signal<Vendor[]>([]);
  isLoading = signal(false);
  error = signal('');

  // ✅ FILTER + SEARCH
  filter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  search = signal('');

  // ✅ DROPDOWN MENU
  menuOpenId = signal<string | null>(null);

  // ✅ REJECT MODAL
  selectedVendor = signal<Vendor | null>(null);
  showRejectModal = signal(false);
  rejectReason = signal('');

  constructor(
    private vendorService: VendorService,
    private router: Router
  ) { }

  ngOnInit() {
    //localStorage.setItem('adminId', '69dcdf5382261495d01985fe');
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

  // ✅ FILTERED LIST
  filteredVendors = computed(() => {
    let list = this.vendors();

    // filter
    if (this.filter() !== 'all') {
      list = list.filter(
        v => v.status?.toLowerCase().trim() === this.filter()
      );
    }

    // search
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

  // ✅ APPROVE
  approve(v: Vendor) {
    const username = prompt('Enter Username');
    const password = prompt('Enter Password');

    if (!username || !password) return;

    // ✅ ADD THIS
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

  // ✅ REJECT FLOW
  openRejectModal(v: Vendor) {
    this.selectedVendor.set(v);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }


  confirmReject() {
    const vendor = this.selectedVendor();
    if (!vendor) return;

    // ✅ ADD THIS
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
        error: (err) => {
          console.error(err);
          alert('Reject failed');
        }
      });
  }
  // ✅ MENU
  toggleMenu(event: Event, id: string) {
    event.stopPropagation();
    this.menuOpenId.set(this.menuOpenId() === id ? null : id);
  }

  // ✅ DELETE
  deleteVendor(id: string) {
    if (!confirm('Delete vendor?')) return;

    this.vendorService.deleteVendor(id).subscribe({
      next: () => this.loadVendors(),
      error: (err) => console.error(err)
    });
  }

  // ✅ EDIT
  editVendor(v: Vendor) {
    this.router.navigate(['/edit-vendor', v._id]);
  }
}