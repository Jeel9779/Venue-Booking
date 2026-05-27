// Purpose: Service: Handles business logic and API communication for subscription.
import { inject, Injectable } from '@angular/core';
import { SubscriptionApi } from '@core/api/subscription-api';
import { SubscriptionStore } from '@core/store/subscription.store';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
// Defines the structure and behavior of this class
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
          const subscriptions = res.subscriptions || [];
          this.store.setAllSubscriptions(subscriptions);
          
          if (res.summary && Object.keys(res.summary).length > 0) {
            this.store.setSummary(res.summary);
          } else {
            // Calculate basic summary from subscriptions if backend doesn't provide it (e.g. in paginated response)
            const summary = {
              total: subscriptions.length,
              active: subscriptions.filter((s: any) => s.status === 'active').length,
              grace: subscriptions.filter((s: any) => s.status === 'grace').length,
              expired: subscriptions.filter((s: any) => s.status === 'expired').length,
              revenue: subscriptions.reduce((acc: number, s: any) => acc + (s.planSnapshot?.price || 0), 0),
              expiringWithin15Days: subscriptions.filter((s: any) => {
                if (s.status !== 'active' || !s.endDate) return false;
                const days = Math.ceil((new Date(s.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return days > 0 && days <= 15;
              }).length
            };
            this.store.setSummary(summary);
          }
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
