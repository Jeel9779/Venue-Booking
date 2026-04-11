import { CommonModule } from '@angular/common';
import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlanService } from '../service/plan.service';
import { Input } from '@angular/core';
import { Plan } from '../models/plan.model';
import { OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './plan-form.html',
  styleUrl: './plan-form.css',
})
export class PlanForm implements OnChanges {
  @Input() planData: Plan | null = null;
  private fb = inject(FormBuilder);
  private planService = inject(PlanService);

  @Output() closeForm = new EventEmitter<void>();
  @Output() planAdded = new EventEmitter<void>();

  planForm = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    duration: [30, [Validators.required]],
    description: ['', Validators.required],
    isActive: [true],
    features: this.fb.control<string[]>([]),
  });
  showForm: any;

  /* onSubmit() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const newPlan = {
      ...this.planForm.value,
      createdAt: new Date().toISOString(),
    };

    this.planService.addPlan(newPlan as any).subscribe({
      next: () => {
        console.log('Plan added');

        this.planForm.reset({
          isActive: true,
          duration: 30,
        });

        this.planAdded.emit();
        this.close(); 
      },
      error: (err) => {
        console.error('Error adding plan', err);
      },
    });
  } */

  onSubmit() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const formData = this.planForm.value;

    if (this.planData) {
      // 🔥 EDIT MODE
      this.planService.updatePlan(this.planData.id!, formData).subscribe({
        next: () => {
          console.log('Plan updated');
          this.planAdded.emit();
          this.close();
        },
      });
    } else {
      // 🔥 ADD MODE
      const newPlan = {
        ...formData,
        createdAt: new Date().toISOString(),
      };

      this.planService.addPlan(newPlan as any).subscribe({
        next: () => {
          console.log('Plan added');
          this.planAdded.emit();
          this.close();
        },
      });
    }
  }

  // close form

  close() {
    this.closeForm.emit();
  }

  /* ngOnInit() {
    if (this.planData) {
      this.planForm.patchValue(this.planData);
    }
  } */

  /*  ngOnChanges(changes: SimpleChanges) {
    if (changes['planData'] && this.planData) {
      this.planForm.patchValue(this.planData);
    }
  } */
  featuresText = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['planData']) {
      if (this.planData) {
        this.planForm.patchValue(this.planData);

        // 🔥 convert array → string for input
        this.featuresText = this.planData.features?.join(', ') || '';
      } else {
        // 🔥 reset for ADD mode
        this.planForm.reset({
          isActive: true,
          duration: 30,
          features: [],
        });

        this.featuresText = '';
      }
    }
  }

  // features field
  onFeaturesInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    const features = value
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f);

    this.planForm.patchValue({ features });
  }
}
