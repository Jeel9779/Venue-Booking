import { inject, Injectable } from '@angular/core';
import { catchError, finalize, forkJoin, of, tap } from 'rxjs';
import { PaymentApi } from '../api/payment-api';
import { PaymentStore } from '../store/payment.store';
import { PaymentFilters } from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly api = inject(PaymentApi);
  private readonly store = inject(PaymentStore);

  /**
   * Loads both payments and stats in parallel
   */
  loadInitialData(): void {
    this.store.setLoading(true);
    const filters = this.store.snapshot.filters;

    this.api.getAll(filters)
      .pipe(
        tap((payments) => {
          if (payments) this.store.setPayments(payments);
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
    const filters = this.store.snapshot.filters;

    this.api
      .getAll(filters)
      .pipe(
        tap((payments) => this.store.setPayments(payments)),
        catchError((err) => {
          this.store.setError(err.message || 'Failed to load payments');
          return of([]);
        }),
        finalize(() => this.store.setLoading(false))
      )
      .subscribe();
  }
}
