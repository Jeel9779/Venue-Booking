import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService } from '@core/services/plan.service';  // plan service
import { PlanStore } from '@core/store/plan.store';        // plan store
import { PlanForm } from '../plan-form/plan-form';          // plan form
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { Model } from '@shared/components/model/model';
import { Plan } from '@core/models/subscription.model';   // subscription model

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [CommonModule, PlanForm, Button, Card, Model],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
export class PlanList implements OnInit {
  private readonly planService = inject(PlanService);
  private readonly planStore = inject(PlanStore);

  // ── State (Signals) ──
  readonly plans = this.planStore.plans;
  readonly isLoading = this.planStore.isLoading;
  readonly error = this.planStore.error;

  showForm = signal(false);
  selectedPlan = signal<Plan | null>(null);

  ngOnInit(): void {
    this.planService.loadAllPlans(); // Admin view
  }

  openAddForm() {
    this.selectedPlan.set(null);
    this.showForm.set(true);
  }

  editPlan(plan: Plan) {
    this.selectedPlan.set(plan);
    this.showForm.set(true);
  }

  deletePlan(id: string) {
    if (confirm('Are you sure you want to delete this plan?')) {
      this.planService.delete(id);
    }
  }

  onFormClose() {
    this.showForm.set(false);
    this.selectedPlan.set(null);
  }
}