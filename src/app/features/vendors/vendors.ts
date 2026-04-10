import { HostListener } from '@angular/core';
import { Component, OnInit, signal } from '@angular/core';
import { VendorService } from './vendor-service';
import { CommonModule } from '@angular/common';
import { computed } from '@angular/core';
import { Vendor } from './vendor.model';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MoreVertical, Pencil, Trash2, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css',
})
export class Vendors implements OnInit {
  // icon
  readonly MoreVertical = MoreVertical;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  vendors = signal<Vendor[]>([]);
  isLoading = signal(false);
  error = signal('');

  constructor(
    private vendorService: VendorService,
    private router: Router,
  ) {}

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

  // ✅ APPROVE
  approve(v: Vendor) {
    this.vendorService
      .updateVendor(v.id, {
        status: 'approved',
        adminMessage: 'Approved successfully',
      })
      .subscribe(() => this.loadVendors());
  }

  // ❌ REJECT
  /* reject(v: Vendor) {
    this.vendorService.updateVendor(v.id, {
      status: 'rejected',
      adminMessage: 'Rejected by admin'
    }).subscribe(() => this.loadVendors());
  } */

  // 🔄 REOPEN
  reopen(v: Vendor) {
    this.vendorService
      .updateVendor(v.id, {
        status: 'pending',
        adminMessage: '',
      })
      .subscribe(() => this.loadVendors());
  }

  // 📄 LICENSE PREVIEW
  previewDoc(url: string) {
    window.open(url, '_blank');
  }

  // Reject pop up ----------------------------
  showRejectModal = signal(false);
  selectedVendor = signal<Vendor | null>(null);
  rejectReason = signal('');

  // update above reject()
  openRejectModal(v: Vendor) {
    this.selectedVendor.set(v);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  // submit rejection
  confirmReject() {
    const vendor = this.selectedVendor();

    if (!vendor) return;

    this.vendorService
      .updateVendor(vendor.id, {
        status: 'rejected',
        adminMessage: this.rejectReason() || 'Rejected by admin',
      })
      .subscribe(() => {
        this.loadVendors();
        this.showRejectModal.set(false);
      });
  }

  // add filter + search ---------------------------------
  filter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  search = signal('');

  filteredVendors = computed(() => {
    let data = this.vendors();

    // FILTER
    if (this.filter() !== 'all') {
      data = data.filter((v) => v.status === this.filter());
    }

    // SEARCH
    if (this.search()) {
      const term = this.search().toLowerCase();

      data = data.filter(
        (v) =>
          v.fullName.toLowerCase().includes(term) ||
          v.email.toLowerCase().includes(term) ||
          v.businessName.toLowerCase().includes(term) ||
          v.businessType.toLowerCase().includes(term) ||
          v.phone?.includes(term),
      );
    }

    return data;
  });

  // reopen
  deleteVendor(id: string) {
    if (confirm('Delete this vendor?')) {
      this.vendorService.deleteVendor(id).subscribe(() => {
        this.loadVendors();
      });
    }
  }

  editVendor(v: Vendor) {
    this.router.navigate(['/edit-vendor', v.id]);
  }

  menuOpenId = signal<string | null>(null);

  toggleMenu(event: Event, id: string) {
    event.stopPropagation();
    this.menuOpenId.set(this.menuOpenId() === id ? null : id);
  }

  @HostListener('document:click')
  closeMenu() {
    this.menuOpenId.set(null);
  }

  isLast(index: number, total: number): boolean {
  return index >= total - 2; // last 2 rows open upward
}
}

