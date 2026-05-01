import { Injectable, signal, computed } from '@angular/core';
import { Plan } from '@core/models/subscription.model';

@Injectable({ providedIn: 'root' })
export class PlanStore {
  // ── State ──
  private readonly _plans = signal<Plan[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors (Computed) ──
  readonly plans = computed(() => this._plans());
  readonly activePlans = computed(() => this._plans().filter(p => p.is_active));
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  // ── Updaters ──
  setPlans(plans: Plan[]) {
    this._plans.set(plans);
  }

  setLoading(loading: boolean) {
    this._isLoading.set(loading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }

  addPlan(plan: Plan) {
    this._plans.update(plans => [plan, ...plans]);
  }

  updatePlan(updatedPlan: Plan) {
    this._plans.update(plans => plans.map(p => p._id === updatedPlan._id ? updatedPlan : p));
  }

  removePlan(id: string) {
    this._plans.update(plans => plans.filter(p => p._id !== id));
  }
}
