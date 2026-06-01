// Purpose: Component/Logic: Handles UI behavior and user interactions for plan-form.
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
// Defines the structure and behavior of this class
export class PlanForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly planService = inject(PlanService);
  private readonly planStore = inject(PlanStore);

  // ── Inputs / Outputs ──
  plan = input<Plan | null>(null);
  onSaved = output<void>();
  onCancel = output<void>();

  // ── State ──
  // Define active base plans for dropdown (only active and non-add-on)
  readonly activeBasePlans = this.planStore.basePlans;
  readonly isLoading = this.planStore.isLoading;
  readonly error = this.planStore.error;

  newFeature = signal('');

  planForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    duration_days: [30, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0)]],
    planType: ['base', [Validators.required]],
    is_active: [true],
    features: [[] as string[]],
    // New field – only required when planType is 'addon'
    parentPlanId: [null] as any,
  });

  durations = [
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
  ];

  selectDuration(days: number) {
    this.planForm.patchValue({ duration_days: days });
  }

  constructor() {
    // Sync form with input plan and set up dynamic validation for add‑on parent selection
    effect(() => {
      const p = this.plan();
      if (p) {
        this.planForm.patchValue({
          name: p.name,
          duration_days: p.duration_days,
          price: p.price,
          planType: p.planType || 'base',
          is_active: p.is_active,
          features: p.features,
          parentPlanId: p.parentPlanId || null
        });
      } else {
        this.planForm.reset({ duration_days: 30, price: 0, planType: 'base', is_active: true, features: [], parentPlanId: null });
      }
    });

    // When the plan type changes, adjust validation for parentPlanId
    this.planForm.get('planType')?.valueChanges.subscribe(type => {
      const parentCtrl = this.planForm.get('parentPlanId');
      if (type === 'addon') {
        parentCtrl?.setValidators([Validators.required]);
      } else {
        parentCtrl?.clearValidators();
        parentCtrl?.setValue(null);
      }
      parentCtrl?.updateValueAndValidity();
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
    // Normalize parentPlanId: send null if empty string or undefined
    if (!payload.parentPlanId) {
      payload.parentPlanId = null;
    }
    // Ensure we don't send undefined parentPlanId for base plans
    if (payload.parentPlanId === undefined) delete payload.parentPlanId;
    const p = this.plan();

    if (p?._id) {
      this.planService.update(p._id, payload, () => this.onSaved.emit());
    } else {
      this.planService.create(payload, () => this.onSaved.emit());
    }
  }
}