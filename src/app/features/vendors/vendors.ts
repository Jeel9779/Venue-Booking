// Purpose: Component/Logic: Handles UI behavior and user interactions for vendors.
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
import { Pagination } from '../../shared/components/pagination/pagination';
import { initialPagination } from '../../core/models/pagination.model';
import { FormInput } from '../../shared/components/form-input/form-input';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Card, Table, Model, Pagination, FormInput, RouterLink, LucideAngularModule],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css',
})
// Defines the structure and behavior of this class
export class Vendors implements OnInit {
  private readonly vendorService = inject(VendorService);
  private readonly vendorStore = inject(VendorStore);

  // ── State (Signals) ────────────────────────────────────────────────────────
  readonly vendors = this.vendorStore.vendors;
  readonly isLoading = this.vendorStore.isLoading;
  readonly error = this.vendorStore.error;
  readonly pagination = this.vendorStore.pagination;

  // ── State (Reactive Signals) ─────────────────────────────────────────────
  search = signal('');
  filter = signal<string>('all');
  sortBy = signal<string>('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  backendStats = signal<{total: number; approved: number; pending: number; rejected: number; suspended: number}>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    suspended: 0
  });

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

  showSuspendModel = signal(false);

  viewingImageUrl = signal<string | null>(null);

  filteredVendors = computed(() => {
    return this.vendors();
  });

  counts = computed(() => {
    const list = this.vendors();
    return {
      all: this.backendStats().total || list.length,
      pending: this.backendStats().pending || list.filter(v => v.status === 'pending').length,
      approved: this.backendStats().approved || list.filter(v => v.status === 'approved').length,
      rejected: this.backendStats().rejected || list.filter(v => v.status === 'rejected').length,
      suspended: this.backendStats().suspended || list.filter(v => v.status === 'suspended').length,
    };
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.fetchData(1);
  }

  loadStats() {
    this.vendorService.getStats().subscribe({
      next: (stats) => {
        if (stats) {
          this.backendStats.set({
            total: stats.total || 0,
            approved: stats.approved || 0,
            pending: stats.pending || 0,
            rejected: stats.rejected || 0,
            suspended: stats.suspended || 0
          });
        }
      }
    });
  }

  fetchData(page: number) {
    this.vendorService.loadAll(page, this.pagination().limit, this.search(), this.filter(), this.sortBy(), this.sortOrder());
    this.loadStats();
  }

  onPageChange(page: number) {
    this.fetchData(page);
  }

  setFilter(filter: string) {
    this.filter.set(filter);
    this.fetchData(1);
  }

  private searchTimeout: any;
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search.set(input.value);
      this.fetchData(1);
    }, 400);
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  openDetails(v: Vendor) {
    console.log('Opening details for vendor:', v);
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

  suspendVendor() {
    this.showSuspendModel.set(true);
  }

  submitSuspend() {
    const v = this.selectedVendor();
    if (!v) return;
    this.vendorService.suspend(v._id);
    this.showSuspendModel.set(false);
    this.closeDetails();
  }

  unsuspendVendor() {
    const vendor = this.selectedVendor();
    if (vendor?._id) {
      this.vendorService.unsuspend(vendor._id);
      this.closeDetails();
    }
  }

  toggleSort(field: string) {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.fetchData(1);
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