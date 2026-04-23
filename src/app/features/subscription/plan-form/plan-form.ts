import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Plan } from '../models/plan.model';
import { PlanService } from '../service/plan.service';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './plan-form.html'
})
export class PlanForm implements OnChanges {
  @Input() planData: Plan | null = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() planAdded = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private planService = inject(PlanService);

  isLoading = false;

  planForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0)]],
    duration: [30, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required]], // This was causing the fail because it wasn't in the HTML
    isActive: [true],
    features: [[] as string[]]
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['planData']) {
      if (this.planData) {
        this.planForm.patchValue(this.planData);
      } else {
        this.planForm.reset({ isActive: true, duration: 30, price: 0, features: [] });
      }
    }
  }

  get currentFeatures(): string[] {
    return this.planForm.get('features')?.value || [];
  }

  addFeature(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value) {
      const updatedFeatures = [...this.currentFeatures, value];
      this.planForm.patchValue({ features: updatedFeatures });
      input.value = '';
    }
  }

  removeFeature(index: number) {
    const updatedFeatures = this.currentFeatures.filter((_, i) => i !== index);
    this.planForm.patchValue({ features: updatedFeatures });
  }

  onSubmit() {
    if (this.planForm.invalid) {
      console.error("FORM INVALID:", this.planForm.errors);
      this.planForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.planForm.value;
    const now = new Date().toISOString();

    if (this.planData && this.planData.id) {
      // UPDATE logic
      this.planService.updatePlan(this.planData.id, { ...formData, updatedAt: now } as Plan).subscribe({
        next: () => this.handleSuccess(),
        error: () => this.isLoading = false
      });
    } else {
      // CREATE logic - Ensure ID is not sent so DB can generate it
      const { ...newPlanData } = formData;
      const newPlan = { ...newPlanData, createdAt: now, updatedAt: now };

      this.planService.addPlan(newPlan as any).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => {
          console.error("API Error:", err);
          this.isLoading = false;
        }
      });
    }
  }

  private handleSuccess() {
    this.isLoading = false;
    this.planAdded.emit();
    this.closeForm.emit();
  }
}