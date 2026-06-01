// Purpose: Component/Logic: Handles UI behavior and user interactions for login.
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
// Defines the structure and behavior of this class
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
    if (this.form.invalid || this.isLoading()) return;

    const { username, password, remember } = this.form.value;
    this.isLoading.set(true);
    this.errorMsg = '';

    const cleanUsername = username ? username.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    // Create an array of possible username cases to try
    const titleCase = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1).toLowerCase();
    const casesToTry = [
      cleanUsername,               // 1. As typed
      cleanUsername.toLowerCase(), // 2. All lowercase
      titleCase,                   // 3. Title Case
      cleanUsername.toUpperCase()  // 4. All uppercase
    ];

    // Remove duplicates to avoid redundant API calls
    const uniqueCases = [...new Set(casesToTry)];

    this.attemptLogin(uniqueCases, cleanPassword, !!remember, 0);
  }

  /**
   * Recursively attempts to login with different casing formats
   * This provides a frontend-simulated case-insensitive login
   */
  private attemptLogin(usernameCases: string[], password: string, remember: boolean, index: number) {
    if (index >= usernameCases.length) {
      // All attempts failed
      this.errorMsg = 'Invalid credentials. Please try again.';
      this.isLoading.set(false);
      return;
    }

    const currentUsername = usernameCases[index];
    console.log(`Attempting login with username: '${currentUsername}'`);

    this.http.post<any>(`${API_BASE_URL}/admin/login`, {
      username: currentUsername,
      password: password
    }).subscribe({
      next: (res) => {
        // Success! Save data and redirect
        const sanitizedAdmin = {
          _id: res.admin._id,
          username: res.admin.username,
          role: res.admin.role || 'admin',
        };

        localStorage.setItem('admin', JSON.stringify(sanitizedAdmin));
        localStorage.setItem('adminId', res.admin._id);

        if (remember) {
          localStorage.setItem('rememberedAdminUsername', this.form.value.username || '');
        } else {
          localStorage.removeItem('rememberedAdminUsername');
        }

        this.isLoading.set(false);
        this.toastService.success(`Login successful! Welcome back, ${res.admin.username}.`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // If it's a 400 error (Invalid credentials), try the next case
        if (err.status === 400 || err.status === 401) {
          this.attemptLogin(usernameCases, password, remember, index + 1);
        } else {
          // For server errors (500) or network errors, stop and show error
          this.errorMsg = err?.error?.message || 'Login failed. Please try again.';
          this.isLoading.set(false);
        }
      }
    });
  }
}