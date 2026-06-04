// Purpose: Store: Manages global/local state and reactivity for plan.
import { Injectable, signal, computed } from '@angular/core';
import { Plan } from '@core/models/subscription.model';

@Injectable({ providedIn: 'root' })
export class PlanStore {
  // ── State ──
  private readonly _plans = signal<Plan[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Pagination & search state
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly searchTerm = signal<string>('');

  // ── Selectors (Computed) ──
  readonly plans = computed(() => this._plans());
  readonly activePlans = computed(() => this._plans().filter(p => p.is_active));
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  // Filtered & paginated
  readonly filteredPlans = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this._plans().filter(p => p.name.toLowerCase().includes(term));
  });
  readonly paginatedPlans = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredPlans().slice(start, start + this.pageSize());
  });

  // ── Additional selectors ──
  // Active base plans (must be base type and active)
  readonly basePlans = computed(() => this._plans().filter(p => p.is_active && p.planType === 'base'));
  // All addon plans
  readonly addonPlans = computed(() => this._plans().filter(p => p.planType === 'addon'));

  /** Returns add‑ons belonging to a specific base plan. Handles string IDs and populated ObjectId documents. */
  /** Returns add‑ons belonging to a specific base plan.
   * Handles string IDs and possible populated objects with an `_id` field.
   */
  getAddonsForBase(baseId: string) {
    return this._plans().filter(p => {
      const pid = typeof p.parentPlanId === 'string'
        ? p.parentPlanId
        : (p.parentPlanId as any)?._id?.toString?.() ?? (p.parentPlanId as any)?.toString?.() ?? null;
      return pid === baseId;
    });
  }

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
