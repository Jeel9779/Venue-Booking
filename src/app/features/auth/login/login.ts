import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '@core/services/toast.service';
import { API_BASE_URL } from '@core/config/api.config';

/**
 * Login Component
 * Handles the authentication for the Admin Dashboard.
 * Includes features like password visibility toggle and 'Remember Me' local storage.
 */
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  // Dependency Injections
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  // State Management
  errorMsg = '';
  isLoading = signal(false);
  showPassword = signal(false); // Controls the password visibility toggle

  // Form Group Initialization with Validators
  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  /**
   * Lifecycle Hook - ngOnInit
   * Checks for an existing active session.
   * Restores the 'Remember Me' username if it was previously saved.
   */
  ngOnInit() {
    // 1. Redirect if already logged in
    const adminId = localStorage.getItem('adminId');
    if (adminId) {
      this.router.navigate(['/dashboard']);
    }

    // 2. Load remembered username if available
    const savedUsername = localStorage.getItem('rememberedAdminUsername');
    if (savedUsername) {
      this.form.patchValue({
        username: savedUsername,
        remember: true
      });
    }
  }

  /**
   * Toggles the password field between 'text' and 'password'
   */
  togglePassword() {
    this.showPassword.update(val => !val);
  }

  /**
   * Handles the form submission to authenticate the admin.
   */
  login() {
    // Prevent submission if form is invalid or already loading
    if (this.form.invalid || this.isLoading()) return;

    const { username, password, remember } = this.form.value;

    // Reset states
    this.isLoading.set(true);
    this.errorMsg = '';

    // API Call to backend
    this.http.post<any>(`${API_BASE_URL}/admin/login`, {
      username,
      password
    }).subscribe({
      next: (res) => {
        // 🔒 SECURITY SANITIZATION:
        // Never store sensitive information like passwords or credentials in local storage!
        // We only extract non-sensitive display fields needed for the frontend header/navigation.
        const sanitizedAdmin = {
          _id: res.admin._id,
          username: res.admin.username,
          role: res.admin.role || 'admin',
        };

        // Save sanitized data
        localStorage.setItem('admin', JSON.stringify(sanitizedAdmin));
        localStorage.setItem('adminId', res.admin._id);

        // Handle 'Remember Me' logic
        if (remember) {
          localStorage.setItem('rememberedAdminUsername', username || '');
        } else {
          localStorage.removeItem('rememberedAdminUsername');
        }

        this.isLoading.set(false);
        this.toastService.success('Login successful! Welcome back.');
        this.router.navigate(['/dashboard']); // Redirect to dashboard
      },
      error: (err) => {
        // Display error message from backend or fallback
        this.errorMsg = err?.error?.message || 'Login failed. Please try again.';
        this.toastService.error(this.errorMsg);
        this.isLoading.set(false);
      }
    });
  }
}