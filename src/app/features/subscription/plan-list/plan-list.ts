import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService } from '../service/plan.service';
import { Plan } from '../models/plan.model';
import { Observable } from 'rxjs';
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

  plans$!: Observable<Plan[]>; // ✅ BACK TO OBSERVABLE

  showForm = false;

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans() {
    this.plans$ = this.planService.getPlans(); // ✅ clean
  }

  deletePlan(id: number) {
    if (!confirm('Are you sure?')) return;

    this.planService.deletePlan(id).subscribe({
      next: () => {
        console.log('Deleted');
        this.loadPlans(); // ✅ refresh observable
        
      },
    });
  }

  // edit
  selectedPlan: Plan | null = null;
  editPlan(plan: Plan) {
    this.selectedPlan = plan;
    this.showForm = true;
  }
}
