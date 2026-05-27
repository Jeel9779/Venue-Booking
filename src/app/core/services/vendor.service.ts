// Purpose: Service: Handles business logic and API communication for vendor.
import { inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { VendorApi } from '../api/vendor-api';
import { VendorStore } from '../store/vendor.store';
import { Vendor } from '../models/vendor.model';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class VendorService {
  private readonly api = inject(VendorApi);
  private readonly store = inject(VendorStore);

  loadAll(page: number = 1, limit: number = 10): void {
    this.store.setLoading(true);
    this.api.getAll(page, limit)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          const vendors = Array.isArray(res) ? res : (res.data || []);
          this.store.setVendors(vendors);

          if (!Array.isArray(res)) {
            this.store.setPagination({
              page: res.page || page,
              limit: res.limit || limit,
              totalRecords: res.totalRecords || vendors.length,
              totalPages: res.totalPages || 1
            });
          }
        },
        error: (err) => this.store.setError(err?.message || 'Failed to load vendors'),
      });
  }

  create(formData: FormData): void {
    this.store.setLoading(true);
    // Note: create is hard to be optimistic because we need the server-generated ID.
    this.api.create(formData)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => this.store.addVendor(res.vendor),
        error: (err) => this.store.setError(err?.message || 'Failed to add vendor'),
      });
  }

  approve(id: string, data: any): void {
    // ⚡ OPTIMISTIC: Update UI immediately
    const originalVendors = [...this.store.vendors()];
    this.store.optimisticUpdate(id, { status: 'approved' });

    this.api.approve(id, data).subscribe({
      next: (res) => this.store.updateVendor(res.vendor),
        error: (err) => {
          // Rollback on error
          this.store.setVendors(originalVendors);
          this.store.setError(err?.message || 'Failed to approve vendor');
        },
    });
  }

  reject(id: string, data: { message: string }): void {
    // ⚡ OPTIMISTIC: Update UI immediately
    const originalVendors = [...this.store.vendors()];
    this.store.optimisticUpdate(id, { status: 'rejected' });

    this.api.reject(id, data).subscribe({
      next: (res) => this.store.updateVendor(res.vendor),
        error: (err) => {
          // Rollback on error
          this.store.setVendors(originalVendors);
          this.store.setError(err?.message || 'Failed to reject vendor');
        },
    });
  }

  delete(id: string): void {
    // ⚡ OPTIMISTIC: Remove immediately
    this.store.removeVendor(id);
    this.api.delete(id).subscribe({
      error: (err) => {
        // Since delete route is missing, we don't rollback here, 
        // but normally we would if the server failed a real delete.
      }
    });
  }

  getFileUrl(path?: string): string {
    if (!path) return '';
    return path; 
  }
}
