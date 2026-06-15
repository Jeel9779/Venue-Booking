// Purpose: Store: Manages global/local state and reactivity for payment.
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Payment, PaymentStats, PaymentFilters } from '../models/payment.model';

interface PaymentState {
  payments: Payment[];
  stats: PaymentStats;
  filters: PaymentFilters;
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  stats: {
    totalRevenue: 0,
    revenueChange: 0,
    pendingAmount: 0,
    pendingCount: 0,
    failedCount: 0,
    successfulAmount: 0,
    successfulCount: 0,
    subscriptionRevenue: 0,
    addonRevenue: 0,
  },
  filters: {
    // Default to all Admin Revenue flows.
    type: '',
    paymentStatus: '',
    vendorId: '',
  },
  pagination: { page: 1, limit: 10, totalRecords: 0, totalPages: 1 },
  isLoading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class PaymentStore {
  private readonly state$ = new BehaviorSubject<PaymentState>(initialState);

  readonly stateView$ = this.state$.asObservable();

  // Selectors
  readonly payments$ = this.stateView$.pipe(map((s) => s.payments));
  readonly stats$ = this.stateView$.pipe(map((s) => s.stats));
  readonly filters$ = this.stateView$.pipe(map((s) => s.filters));
  readonly pagination$ = this.stateView$.pipe(map((s) => s.pagination));
  readonly isLoading$ = this.stateView$.pipe(map((s) => s.isLoading));
  readonly error$ = this.stateView$.pipe(map((s) => s.error));

  get snapshot(): PaymentState {
    return this.state$.getValue();
  }

  // Actions
  setPayments(payments: Payment[]): void {
    this.state$.next({ ...this.snapshot, payments, isLoading: false, error: null });
  }

  setStats(stats: PaymentStats): void {
    this.state$.next({ ...this.snapshot, stats });
  }

  updateFilters(filters: Partial<PaymentFilters>): void {
    this.state$.next({
      ...this.snapshot,
      filters: { ...this.snapshot.filters, ...filters },
    });
  }

  resetFilters(): void {
    this.state$.next({ ...this.snapshot, filters: initialState.filters });
  }

  setLoading(isLoading: boolean): void {
    this.state$.next({ ...this.snapshot, isLoading });
  }

  setError(error: string | null): void {
    this.state$.next({ ...this.snapshot, error, isLoading: false });
  }

  setPagination(pagination: { page: number; limit: number; totalRecords: number; totalPages: number }): void {
    this.state$.next({ ...this.snapshot, pagination });
  }
}
