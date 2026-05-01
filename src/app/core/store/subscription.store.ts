import { Injectable, signal, computed } from '@angular/core';
import { Subscription, SubscriptionQueue } from '@core/models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionStore {
  // ── State ──
  private readonly _currentSubscription = signal<Subscription | null>(null);
  private readonly _queue = signal<SubscriptionQueue[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors (Computed) ──
  readonly currentSubscription = computed(() => this._currentSubscription());
  readonly queue = computed(() => this._queue());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  // ── Updaters ──
  setSubscription(sub: Subscription | null) {
    this._currentSubscription.set(sub);
  }

  setQueue(queue: SubscriptionQueue[]) {
    this._queue.set(queue);
  }

  setLoading(loading: boolean) {
    this._isLoading.set(loading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }
}
