import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService } from '../services/plan.service';
import { Plan } from '../models/plan.model';

@Component({
  selector: 'app-plan-list',
  imports: [CommonModule],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
export class PlanList implements OnInit {

  private planService = inject(PlanService);

  plans: Plan[] = [];

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans() {
    this.planService.getPlans().subscribe({
      next: (res) => {
        this.plans = res;
      },
      error: (err) => {
        console.error('Error loading plans', err);
      }
    });
  }

  deletePlan(id: number) {
    if (!confirm('Are you sure to delete this plan?')) return;

    this.planService.deletePlan(id).subscribe(() => {
      this.loadPlans();
    });
  }

  toggleStatus(plan: Plan) {
    this.planService.toggleStatus(plan).subscribe(() => {
      this.loadPlans();
    });
  }
}
