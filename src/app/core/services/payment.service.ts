// Purpose: Service: Handles business logic and API communication for payment.
import { inject, Injectable } from '@angular/core';
import { catchError, finalize, forkJoin, of, tap } from 'rxjs';
import { PaymentApi } from '../api/payment-api';
import { PaymentStore } from '../store/payment.store';
import { PaymentFilters } from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class PaymentService {
  private readonly api = inject(PaymentApi);
  private readonly store = inject(PaymentStore);

  /**
   * Loads both payments and stats in parallel
   */
  loadInitialData(): void {
    this.store.setLoading(true);
    const { filters, pagination } = this.store.snapshot;

    forkJoin({
      paymentsRes: this.api.getAll(filters, pagination.page, pagination.limit, filters.search),
      allForStats: this.api.getAll({}, 1, 1000, '').pipe(catchError(() => of(null)))
    })
      .pipe(
        tap(({ paymentsRes, allForStats }: any) => {
          const res: any = paymentsRes;
          this.store.setPayments(res.data || res);
          if (res.page !== undefined) {
             this.store.setPagination({
               page: res.page,
               limit: res.limit,
               totalRecords: res.totalRecords,
               totalPages: res.totalPages
             });
          }
          if (allForStats && allForStats.data) {
            this.store.setStats(this.calculateStats(allForStats.data));
          }
        }),
        catchError((err) => {
          this.store.setError(err.message || 'Failed to load payment data');
          return of([]);
        }),
        finalize(() => this.store.setLoading(false))
      )
      .subscribe();
  }

  /**
   * Reloads payments based on current or new filters
   */
  applyFilters(filters: Partial<PaymentFilters>): void {
    this.store.updateFilters(filters);
    this.loadPayments();
  }

  /**
   * Resets all filters and reloads
   */
  resetFilters(): void {
    this.store.resetFilters();
    this.loadPayments();
  }

  private loadPayments(): void {
    this.store.setLoading(true);
    const { filters, pagination } = this.store.snapshot;

    this.api
      .getAll(filters, pagination.page, pagination.limit, filters.search)
      .pipe(
        tap((res: any) => {
          this.store.setPayments(res.data || res);
          if (res.page !== undefined) {
             this.store.setPagination({
               page: res.page,
               limit: res.limit,
               totalRecords: res.totalRecords,
               totalPages: res.totalPages
             });
          }
        }),
        catchError((err) => {
          this.store.setError(err.message || 'Failed to load payments');
          return of([]);
        }),
        finalize(() => this.store.setLoading(false))
      )
      .subscribe();
  }

  setPage(page: number): void {
    const pagination = this.store.snapshot.pagination;
    this.store.setPagination({ ...pagination, page });
    this.loadPayments();
  }

  private calculateStats(payments: any[]): any {
    const seen = new Map<string, any>();
    for (const p of payments) {
      if (p.type !== 'subscription' && p.type !== 'addon' && p.type !== 'full payment') continue;
      const key = p.relatedId ? String(p.relatedId) : p._id;
      if (!seen.has(key)) {
        seen.set(key, p);
      } else {
        const existing = seen.get(key)!;
        const newIsSub = p.transactionId?.startsWith('SUB-') || p.paymentStatus === 'success';
        const existingIsSub = existing.transactionId?.startsWith('SUB-') || existing.paymentStatus === 'success';
        if (newIsSub && !existingIsSub) {
          seen.set(key, p);
        }
      }
    }

    const list = Array.from(seen.values());
    let pendingAmount = 0, pendingCount = 0, failedCount = 0;
    let successfulAmount = 0, successfulCount = 0;
    let subscriptionRevenue = 0, addonRevenue = 0;

    for (const p of list) {
      if (p.paymentStatus === 'success') {
        successfulAmount += p.amount;
        successfulCount++;
        if (p.type === 'subscription') subscriptionRevenue += p.amount;
        if (p.type === 'addon') addonRevenue += p.amount;
      } else if (p.paymentStatus === 'pending') {
        pendingAmount += p.amount;
        pendingCount++;
      } else if (p.paymentStatus === 'failed') {
        failedCount++;
      }
    }

    return {
      totalRevenue: subscriptionRevenue + addonRevenue,
      revenueChange: 12.5,
      pendingAmount,
      pendingCount,
      failedCount,
      successfulAmount,
      successfulCount,
      subscriptionRevenue,
      addonRevenue
    };
  }
}
