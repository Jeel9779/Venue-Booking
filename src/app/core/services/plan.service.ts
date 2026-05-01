import { inject, Injectable } from '@angular/core';
import { PlanApi } from '@core/api/plan-api';
import { PlanStore } from '@core/store/plan.store';
import { finalize } from 'rxjs';
import { Plan } from '@core/models/subscription.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly api = inject(PlanApi);
  private readonly store = inject(PlanStore);

  loadActivePlans() {
    this.store.setLoading(true);
    this.api.getActivePlans()
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => this.store.setPlans(res.plans),
        error: (err) => this.store.setError(err.error?.message || 'Failed to load plans')
      });
  }

  loadAllPlans() {
    this.store.setLoading(true);
    this.api.getAllPlans()
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => this.store.setPlans(res.plans),
        error: (err) => this.store.setError(err.error?.message || 'Failed to load all plans')
      });
  }

  create(payload: Partial<Plan>, callback?: () => void) {
    this.store.setLoading(true);
    this.api.createPlan(payload)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.store.addPlan(res.plan);
          if (callback) callback();
        },
        error: (err) => this.store.setError(err.error?.message || 'Failed to create plan')
      });
  }

  update(id: string, payload: Partial<Plan>, callback?: () => void) {
    this.store.setLoading(true);
    this.api.updatePlan(id, payload)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.store.updatePlan(res.plan);
          if (callback) callback();
        },
        error: (err) => this.store.setError(err.error?.message || 'Failed to update plan')
      });
  }

  delete(id: string) {
    this.store.setLoading(true);
    this.api.deletePlan(id)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: () => this.store.removePlan(id),
        error: (err) => this.store.setError(err.error?.message || 'Failed to delete plan')
      });
  }
}
