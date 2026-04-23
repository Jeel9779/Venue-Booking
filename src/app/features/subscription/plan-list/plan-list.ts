import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService } from '../service/plan.service';
import { Plan } from '../models/plan.model';
import { Observable, finalize } from 'rxjs';
import { PlanForm } from '../plan-form/plan-form';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [CommonModule, PlanForm],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
export class PlanList implements OnInit {
  private planService = inject(PlanService);

  plans$!: Observable<Plan[]>;
  showForm = false;
  selectedPlan: Plan | null = null;
  isDeleting = false;

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans() {
    this.plans$ = this.planService.getPlans();
  }

  openAddForm() {
    this.selectedPlan = null;
    this.showForm = true;
  }

  editPlan(plan: Plan) {
    this.selectedPlan = plan;
    this.showForm = true;
  }

  deletePlan(id: string | undefined) {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;

    this.isDeleting = true;
    this.planService.deletePlan(id!).pipe(
      finalize(() => this.isDeleting = false)
    ).subscribe({
      next: () => {
        console.log('Plan removed successfully');
        this.loadPlans();
      }
    });
  }
}