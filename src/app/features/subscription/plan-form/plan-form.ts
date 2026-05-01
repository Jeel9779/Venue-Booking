import { Component, OnInit, inject, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Plan } from '@core/models/subscription.model';   // subscription model
import { PlanService } from '@core/services/plan.service'; // plan service
import { PlanStore } from '@core/store/plan.store';       // plan store
import { Button } from '@shared/components/button/button';
import { FormInput } from '@shared/components/form-input/form-input';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Button, FormInput],
  templateUrl: './plan-form.html',
})
export class PlanForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly planService = inject(PlanService);
  private readonly planStore = inject(PlanStore);

  // ── Inputs / Outputs ──
  plan = input<Plan | null>(null);
  onSaved = output<void>();
  onCancel = output<void>();

  // ── State ──
  readonly isLoading = this.planStore.isLoading;
  readonly error = this.planStore.error;

  newFeature = signal('');

  planForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    duration_days: [30, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0)]],
    is_active: [true],
    features: [[] as string[]]
  });

  constructor() {
    // Sync form with input plan
    effect(() => {
      const p = this.plan();
      if (p) {
        this.planForm.patchValue({
          name: p.name,
          duration_days: p.duration_days,
          price: p.price,
          is_active: p.is_active,
          features: p.features
        });
      } else {
        this.planForm.reset({ duration_days: 30, price: 0, is_active: true, features: [] });
      }
    });
  }

  ngOnInit(): void { }

  get features(): string[] {
    return this.planForm.get('features')?.value || [];
  }

  addFeature() {
    const val = this.newFeature().trim();
    if (val) {
      this.planForm.patchValue({ features: [...this.features, val] });
      this.newFeature.set('');
    }
  }

  removeFeature(index: number) {
    const updated = this.features.filter((_, i) => i !== index);
    this.planForm.patchValue({ features: updated });
  }

  onSubmit() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const payload = this.planForm.value as Partial<Plan>;
    const p = this.plan();

    if (p?._id) {
      this.planService.update(p._id, payload, () => this.onSaved.emit());
    } else {
      this.planService.create(payload, () => this.onSaved.emit());
    }
  }
}