import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../core/services/vendor.service';
import { VendorStore } from '../../core/store/vendor.store';
import { Vendor } from '../../core/models/vendor.model';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';
import { Table } from '../../shared/components/table/table';
import { Model } from '../../shared/components/model/model';
import { FormInput } from '../../shared/components/form-input/form-input';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Card, Table, Model, FormInput, RouterLink],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css',
})
export class Vendors implements OnInit {
  private readonly vendorService = inject(VendorService);
  private readonly vendorStore = inject(VendorStore);

  // ── State (Signals) ────────────────────────────────────────────────────────
  readonly vendors = this.vendorStore.vendors;
  readonly isLoading = this.vendorStore.isLoading;
  readonly error = this.vendorStore.error;

  search = signal('');
  filter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');

  selectedVendor = signal<Vendor | null>(null);
  showDetailsModel = signal(false);
  
  // Moderation state
  showApproveModel = signal(false);
  approveData = signal({ username: '', password: '' });
  
  showRejectModel = signal(false);
  rejectReason = signal('');

  showDeleteModel = signal(false);
  deleteReason = signal('');
  vendorToDelete = signal<Vendor | null>(null);

  viewingImageUrl = signal<string | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────────
  filteredVendors = computed(() => {
    let list = this.vendors();
    if (this.filter() !== 'all') {
      list = list.filter((v) => v.status === this.filter());
    }
    const q = this.search().toLowerCase().trim();
    if (q) {
      list = list.filter(v =>
        v.fullName.toLowerCase().includes(q) ||
        v.businessName.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.businessType.toLowerCase().includes(q) ||
        v.state.toLowerCase().includes(q) ||
        new Date(v.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase().includes(q)
      );
    }
    return list;
  });

  counts = computed(() => {
    const list = this.vendors();
    return {
      all: list.length,
      pending: list.filter(v => v.status === 'pending').length,
      approved: list.filter(v => v.status === 'approved').length,
      rejected: list.filter(v => v.status === 'rejected').length,
    };
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.vendorService.loadAll();
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  openDetails(v: Vendor) {
    this.selectedVendor.set(v);
    this.showDetailsModel.set(true);
  }

  closeDetails() {
    this.showDetailsModel.set(false);
    this.selectedVendor.set(null);
  }

  // Approve flow
  openApproveModel() {
    const v = this.selectedVendor();
    const suggestedName = v ? v.fullName.trim() : '';
    this.approveData.set({ username: suggestedName, password: '' });
    this.showApproveModel.set(true);
  }

  submitApprove() {
    const v = this.selectedVendor();
    if (!v || !this.approveData().username || !this.approveData().password) return;
    this.vendorService.approve(v._id, this.approveData());
    this.showApproveModel.set(false);
    this.closeDetails();
  }

  // Reject flow
  openRejectModel() {
    this.rejectReason.set('');
    this.showRejectModel.set(true);
  }

  submitReject() {
    const v = this.selectedVendor();
    if (!v || !this.rejectReason().trim()) return;
    this.vendorService.reject(v._id, { message: this.rejectReason() });
    this.showRejectModel.set(false);
    this.closeDetails();
  }

  deleteVendor(v: Vendor) {
    this.vendorToDelete.set(v);
    this.deleteReason.set('');
    this.showDeleteModel.set(true);
  }

  submitDelete() {
    const v = this.vendorToDelete();
    if (!v || !this.deleteReason().trim()) return;
    this.vendorService.delete(v._id);
    this.showDeleteModel.set(false);
    this.vendorToDelete.set(null);
  }

  getFileUrl(path?: string) {
    return this.vendorService.getFileUrl(path);
  }

  openImageViewer(path?: string) {
    if (!path) return;
    this.viewingImageUrl.set(this.getFileUrl(path));
  }

  closeImageViewer() {
    this.viewingImageUrl.set(null);
  }

  dismissError() {
    this.vendorStore.setError(null);
  }
}