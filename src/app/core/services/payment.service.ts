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
      paymentsRes: this.api.getAll(filters, pagination.page, pagination.limit, filters.search, filters.sortBy, filters.sortOrder),
      allForStats: this.api.getAll({}, 1, 1000, '', '', '').pipe(catchError(() => of(null)))
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
  applyFilters(filters: Partial<PaymentFilters>, resetPage: boolean = true): void {
    this.store.updateFilters(filters);
    
    if (resetPage) {
      // Reset to page 1 when applying new filters to avoid missing data on deep pages
      const pagination = this.store.snapshot.pagination;
      this.store.setPagination({ ...pagination, page: 1 });
    }
    
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

    const apiLimit = filters.search ? 1000 : pagination.limit;

    this.api
      .getAll(filters, pagination.page, apiLimit, filters.search, filters.sortBy, filters.sortOrder)
      .pipe(
        tap((res: any) => {
          this.store.setPayments(res.data || res);
          if (res.page !== undefined) {
             const actualTotalPages = filters.search 
                 ? Math.max(1, Math.ceil((res.totalRecords || (res.data?.length || 0)) / pagination.limit))
                 : res.totalPages;

             this.store.setPagination({
               page: res.page,
               limit: pagination.limit,
               totalRecords: res.totalRecords || (res.data?.length || 0),
               totalPages: actualTotalPages
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
      const type = (p.type || '').toLowerCase();
      if (type !== 'subscription' && type !== 'addon' && type !== 'full payment' && type !== 'booking') continue;
      const key = p.relatedId ? String(p.relatedId) : p._id;
      if (!seen.has(key)) {
        seen.set(key, p);
      } else {
        const existing = seen.get(key)!;
        const newStatus = (p.paymentStatus || '').toLowerCase();
        const oldStatus = (existing.paymentStatus || '').toLowerCase();
        const newIsSub = p.transactionId?.startsWith('SUB-') || newStatus === 'success' || newStatus === 'completed';
        const existingIsSub = existing.transactionId?.startsWith('SUB-') || oldStatus === 'success' || oldStatus === 'completed';
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
      const status = (p.paymentStatus || '').toLowerCase();
      const type = (p.type || '').toLowerCase();
      
      if (status === 'success' || status === 'completed') {
        successfulAmount += p.amount;
        successfulCount++;
        if (type === 'subscription') subscriptionRevenue += p.amount;
        if (type === 'addon') addonRevenue += p.amount;
      } else if (status === 'pending') {
        pendingAmount += p.amount;
        pendingCount++;
      } else if (status === 'failed') {
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
