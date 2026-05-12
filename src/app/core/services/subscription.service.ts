import { inject, Injectable } from '@angular/core';
import { SubscriptionApi } from '@core/api/subscription-api';
import { SubscriptionStore } from '@core/store/subscription.store';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(SubscriptionApi);
  private readonly store = inject(SubscriptionStore);

  loadCurrentSubscription() {
    this.store.setLoading(true);
    this.api.getCurrentSubscription()
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => this.store.setSubscription(res.subscription),
        error: (err) => this.store.setError(err.error?.message || 'Failed to load subscription')
      });
  }

  loadQueue() {
    this.store.setLoading(true);
    this.api.getQueue()
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => this.store.setQueue(res.queue),
        error: (err) => this.store.setError(err.error?.message || 'Failed to load queue')
      });
  }

  purchase(planId: string) {
    this.store.setLoading(true);
    this.api.purchasePlan(planId)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          // If immediately activated, refresh subscription
          if (!res.queued) {
            this.loadCurrentSubscription();
          } else {
            // If queued, refresh queue
            this.loadQueue();
          }
        },
        error: (err) => this.store.setError(err.error?.message || 'Failed to purchase plan')
      });
  }
  // Admin Actions
  loadAllSubscriptions() {
    this.store.setLoading(true);
    this.api.adminGetAllSubscriptions()
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.store.setAllSubscriptions(res.subscriptions);
          this.store.setSummary(res.summary);
        },
        error: (err) => this.store.setError(err.error?.message || 'Failed to load all subscriptions')
      });
  }

  adminAssign(data: { vendorId: string; planId: string; startDate?: string; endDate?: string }) {
    this.store.setLoading(true);
    this.api.adminAssign(data)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: () => this.loadAllSubscriptions(),
        error: (err) => this.store.setError(err.error?.message || 'Failed to assign subscription')
      });
  }

  adminFullPayment(data: { vendorId: string; planId: string; startDate?: string; endDate?: string }) {
    this.store.setLoading(true);
    this.api.adminFullPayment(data)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: () => this.loadAllSubscriptions(),
        error: (err) => this.store.setError(err.error?.message || 'Failed to record full payment')
      });
  }
}
