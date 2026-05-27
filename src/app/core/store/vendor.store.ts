// Purpose: Store: Manages global/local state and reactivity for vendor.
import { Injectable, signal, computed } from '@angular/core';
import { Vendor, VendorState } from '../models/vendor.model';
import { initialPagination, Pagination } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class VendorStore {
  // ── State ──────────────────────────────────────────────────────────────────
  private readonly _state = signal<VendorState>({
    vendors: [],
    pagination: initialPagination,
    isLoading: false,
    error: null,
  });

  // ── Selectors ──────────────────────────────────────────────────────────────
  readonly vendors = computed(() => this._state().vendors);
  readonly pagination = computed(() => this._state().pagination);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // ── Actions ────────────────────────────────────────────────────────────────
  setVendors(vendors: Vendor[]): void {
    this._state.update((s) => ({ ...s, vendors, isLoading: false, error: null }));
  }

  setPagination(pagination: Pagination): void {
    this._state.update((s) => ({ ...s, pagination }));
  }

  setLoading(isLoading: boolean): void {
    this._state.update((s) => ({ ...s, isLoading }));
  }

  setError(error: string | null): void {
    this._state.update((s) => ({ ...s, error, isLoading: false }));
  }

  // ⚡ OPTIMISTIC UPDATE: Instant UI change
  optimisticUpdate(id: string, changes: Partial<Vendor>): void {
    this._state.update((s) => ({
      ...s,
      vendors: s.vendors.map((v) => (v._id === id ? { ...v, ...changes } : v)),
    }));
  }

  updateVendor(updatedVendor: Vendor): void {
    this._state.update((s) => ({
      ...s,
      vendors: s.vendors.map((v) => (v._id === updatedVendor._id ? updatedVendor : v)),
    }));
  }

  removeVendor(id: string): void {
    this._state.update((s) => ({
      ...s,
      vendors: s.vendors.filter((v) => v._id !== id),
    }));
  }

  addVendor(vendor: Vendor): void {
    this._state.update((s) => ({
      ...s,
      vendors: [vendor, ...s.vendors],
    }));
  }
}
