// Purpose: Component/Logic: Handles UI behavior and user interactions for register.
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '@core/services/toast.service';
import { API_BASE_URL } from '@core/config/api.config';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
// Defines the structure and behavior of this class
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  errorMsg = '';
  successMsg = '';
  isLoading = signal(false);
  showPassword = signal(false);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(g: AbstractControl) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  register() {
    if (this.form.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMsg = '';
    this.successMsg = '';

    const { username, password } = this.form.value;

    this.http.post<any>(`${API_BASE_URL}/admin/register`, {
      username,
      password
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMsg = 'Admin registered successfully! Redirecting to login...';
        this.toastService.success('Account created successfully!');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Registration failed. Please try again.';
        this.toastService.error(this.errorMsg);
        this.isLoading.set(false);
      }
    });
  }
}
