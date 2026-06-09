// Purpose: Component/Logic: Handles UI behavior and user interactions for plan-list.
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
  imports: [CommonModule, PlanForm, Button, Model],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
// Defines the structure and behavior of this class
export class PlanList implements OnInit {
  private readonly planService = inject(PlanService);
  private readonly planStore = inject(PlanStore);

  // ── State (Signals) ──
  readonly plans = this.planStore.plans;
  readonly isLoading = this.planStore.isLoading;
  readonly error = this.planStore.error;

  showForm = signal(false);
  selectedPlan = signal<Plan | null>(null);
  planToDelete = signal<string | null>(null);
  
  // Helper to get base plan name for an add‑on
  getBasePlanName(parentId: string | null | undefined): string {
    if (!parentId) return '';
    const base = this.planStore.basePlans().find(p => p._id === parentId);
    return base?.name ?? '';
  }

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
    this.planToDelete.set(id);
  }

  cancelDelete() {
    this.planToDelete.set(null);
  }

  executeDelete() {
    const id = this.planToDelete();
    if (id) {
      this.planService.delete(id);
      this.planToDelete.set(null);
    }
  }

  onFormClose() {
    this.showForm.set(false);
    this.selectedPlan.set(null);
  }
}