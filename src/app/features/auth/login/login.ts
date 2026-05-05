import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  ngOnInit() {
    const adminId = localStorage.getItem('adminId');
    if (adminId) {
      this.router.navigate(['/dashboard']); // already logged in
    }
  }

  fb = inject(FormBuilder);
  router = inject(Router);
  http = inject(HttpClient);

  errorMsg = '';
  isLoading = signal(false);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  login() {
    if (this.form.invalid || this.isLoading()) return;

    const { username, password } = this.form.value;
    this.isLoading.set(true);
    this.errorMsg = '';

    this.http.post<any>('http://192.168.1.7:3000/admin/login', {
      username,
      password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('adminId', res.admin._id);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Login failed. Please try again.';
        this.isLoading.set(false);
      }
    });
  }
}